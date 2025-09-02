import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, anonymous, organization } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import * as schema from '../db/schema';
import { boards, tags } from '../db/schema';
import { sendEmail } from '../email';
import type { AppEnv } from './env';

interface AuthInstance {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (context: { headers: Headers }) => Promise<any>;
    createOrganization: (input: {
      body: { name: string; slug: string; userId?: string };
    }) => Promise<any>;
  };
}

export function getAuth(env: AppEnv): AuthInstance {
  const config = {
    baseURL: env.BETTER_AUTH_URL as string,
    database: drizzleAdapter(getDb(env), {
      provider: 'pg',
      schema,
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
      expiresIn: 60 * 60 * 24 * 28,
      updateAge: 60 * 60 * 24 * 7,
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
        organizationCreation: {
          afterCreate: async ({ user, organization }) => {
            if (env.NODE_ENV === 'production') {
              await sendEmail(env, user.email, 'welcome', user.name);
            }

            const db = getDb(env);

            await db
              .update(schema.user)
              .set({ organizationId: organization.id })
              .where(eq(schema.user.id, user.id));

            // Seed defaults (idempotent)
            try {
              const existingBoards = await db
                .select({ id: boards.id })
                .from(boards)
                .where(eq(boards.organizationId, organization.id))
                .limit(1);

              if (existingBoards.length === 0) {
                // Boards
                await db.insert(boards).values([
                  {
                    id: crypto.randomUUID(),
                    organizationId: organization.id,
                    name: 'Feature Requests',
                    slug: 'features',
                    description: 'Collect ideas and feature requests',
                    isPrivate: false,
                  },
                  {
                    id: crypto.randomUUID(),
                    organizationId: organization.id,
                    name: 'Bugs',
                    slug: 'bugs',
                    description: 'Report and track bugs',
                    isPrivate: false,
                  },
                ]);

                // Labels/Tags (match admin mock defaults)
                const defaultTags = [
                  { name: 'UI Enhancement', color: 'purple' },
                  { name: 'Bug', color: 'red' },
                  { name: 'Feature', color: 'green' },
                  { name: 'Documentation', color: 'blue' },
                  { name: 'Refactor', color: 'yellow' },
                  { name: 'Performance', color: 'orange' },
                  { name: 'Design', color: 'pink' },
                  { name: 'Security', color: 'gray' },
                  { name: 'Accessibility', color: 'indigo' },
                  { name: 'Testing', color: 'teal' },
                  { name: 'Internationalization', color: 'cyan' },
                ];
                await db.insert(tags).values(
                  defaultTags.map((t) => ({
                    organizationId: organization.id,
                    name: t.name,
                    color: t.color,
                  }))
                );
              }
            } catch {
              //
            }
          },
        },
      }),
      anonymous({
        emailDomainName: 'anon.us',
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          // TODO: When we allow user to post without signup, update here to migrate post on linking account
          const db = getDb(env);
          const anonymousUserId = anonymousUser.user.id;
          const newUserId = newUser.user.id;

          // Run all migrations concurrently with Promise.allSettled
          await Promise.allSettled([
            // Migrate votes
            db
              .update(schema.votes)
              .set({ userId: newUserId })
              .where(eq(schema.votes.userId, anonymousUserId)),

            // Migrate posts (feedback)
            db
              .update(schema.feedback)
              .set({ authorId: newUserId })
              .where(eq(schema.feedback.authorId, anonymousUserId)),

            // Migrate comments
            db
              .update(schema.comments)
              .set({ authorId: newUserId })
              .where(eq(schema.comments.authorId, anonymousUserId)),
          ]);
        },
      }),
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config) as AuthInstance;
}
