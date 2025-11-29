import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { type BetterAuthOptions, betterAuth } from 'better-auth/minimal';
import { admin, anonymous, organization } from 'better-auth/plugins';
import { and, eq } from 'drizzle-orm';
import { defaultBoards, defaultTags, session as sessionConfig } from '@/config';
import { slugifyTitle } from '@/utils/slug';
import { getDb } from '../db';
import * as schema from '../db/schema';
import { boards, member, tags, team, teamMember } from '../db/schema';
import { sendEmail, sendInvitationEmail } from '../email';
import type { AppEnv } from './env';
import { logger } from './logger';

// biome-ignore lint/suspicious/noExplicitAny: <Can't find a solution to this type error, searched through many of the issues related to types on better-auth repo but nothing works>
export function getAuth(env: AppEnv): ReturnType<typeof betterAuth> | any {
  const db = getDb(env);

  const config = {
    baseURL: env.BETTER_AUTH_URL as string,
    secret: env.BETTER_AUTH_SECRET as string,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    logger: {
      level: 'error',
      disabled: false,
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            try {
              const userMembership = await db
                .select({
                  organizationId: member.organizationId,
                })
                .from(member)
                .where(eq(member.userId, session.userId))
                .limit(1);

              const firstMembership = userMembership[0];
              if (!firstMembership?.organizationId) {
                return { data: session };
              }

              const userTeams = await db
                .select({ teamId: teamMember.teamId })
                .from(teamMember)
                .innerJoin(team, eq(team.id, teamMember.teamId))
                .where(
                  and(
                    eq(teamMember.userId, session.userId),
                    eq(team.organizationId, firstMembership.organizationId),
                  ),
                )
                .limit(1);

              return {
                data: {
                  ...session,
                  activeOrganizationId: firstMembership.organizationId,
                  ...(userTeams[0]?.teamId && {
                    activeTeamId: userTeams[0].teamId,
                  }),
                },
              };
            } catch (error) {
              logger.error('Failed to set active organization on session', {
                scope: 'auth',
                context: { userId: session.userId },
                error,
                operational: true, // Session still works without active org
              });
              return { data: session };
            }
          },
        },
      },
    },
    session: {
      expiresIn: sessionConfig.expiresInSeconds,
      updateAge: sessionConfig.updateAgeSeconds,
    },
    trustedOrigins: ['*'],
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: env.COOKIE_DOMAIN,
      },
      defaultCookieAttributes: {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        // partitioned: true, // Don't know what it is for yet read something but didn't understand shit
      },
    },
    socialProviders: {
      google: {
        clientId: (env.GOOGLE_CLIENT_ID as string) || '',
        clientSecret: (env.GOOGLE_CLIENT_SECRET as string) || '',
      },
    },
    plugins: [
      admin(),
      organization({
        teams: {
          enabled: true,
        },
        organizationHooks: {
          afterCreateInvitation: async (data) => {
            const inviteLink = `${env.FRONTEND_URL}/auth/accept-invitation/${data.invitation.id}`;

            // Look up team name if teamId is provided
            let teamName: string | undefined;
            const teamId = data.invitation.teamId;
            if (teamId) {
              const teamResult = await db
                .select({ name: team.name })
                .from(team)
                .where(eq(team.id, teamId))
                .limit(1);
              teamName = teamResult[0]?.name;
            }

            await sendInvitationEmail(env, data.invitation.email, {
              inviterName: data.inviter.name,
              inviterEmail: data.inviter.email,
              organizationName: data.organization.name,
              teamName,
              role: data.invitation.role,
              inviteLink,
              expiresInDays: 7,
            });
          },
          afterCreateTeam: async (data) => {
            const dbConn = db;

            // Seed defaults (idempotent)
            try {
              const teamSlug = slugifyTitle(data.team.name);
              await dbConn
                .update(team)
                .set({ slug: teamSlug })
                .where(eq(team.id, data.team.id));

              const existingBoards = await dbConn
                .select({ id: boards.id })
                .from(boards)
                .where(eq(boards.teamId, data.team.id))
                .limit(1);

              if (existingBoards.length === 0) {
                // Seed default boards
                await dbConn.insert(boards).values(
                  defaultBoards.map((board) => ({
                    teamId: data.team.id,
                    name: board.name,
                    slug: board.slug,
                    description: board.description,
                    ...('isSystem' in board && { isSystem: board.isSystem }),
                    ...('isPrivate' in board && { isPrivate: board.isPrivate }),
                  })),
                );

                // Seed default tags
                await dbConn.insert(tags).values(
                  defaultTags.map((tag) => ({
                    teamId: data.team.id,
                    name: tag.name,
                    color: tag.color,
                  })),
                );
              }
            } catch (error) {
              logger.error('Failed to seed default boards/tags for team', {
                scope: 'auth',
                context: { teamId: data.team.id },
                error,
                operational: true, // Seeding is best-effort, team creation continues
              });
            }
          },
        },

        organizationCreation: {
          afterCreate: async ({ user }) => {
            if (env.NODE_ENV === 'production') {
              await sendEmail(env, user.email, 'welcome', {
                firstname: user.name,
              });
            }
          },
        },
      }),
      anonymous({
        emailDomainName: 'anon.us',
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          // TODO: When we allow user to post without signup, update here to migrate post on linking account
          const dbConn = getDb(env);
          const anonymousUserId = anonymousUser.user.id;
          const newUserId = newUser.user.id;

          // Run all migrations concurrently with Promise.allSettled
          await Promise.allSettled([
            // Migrate votes
            dbConn
              .update(schema.votes)
              .set({ userId: newUserId })
              .where(eq(schema.votes.userId, anonymousUserId)),

            // Migrate posts (feedback)
            // db
            //   .update(schema.feedback)
            //   .set({ authorId: newUserId })
            //   .where(eq(schema.feedback.authorId, anonymousUserId)),

            // Migrate comments
            dbConn
              .update(schema.comments)
              .set({ authorId: newUserId })
              .where(eq(schema.comments.authorId, anonymousUserId)),
          ]);
        },
      }),
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}
