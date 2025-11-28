import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { member, user } from '@/db/schema';
import { getAuth } from '@/lib/auth';
import { adminOnlyProcedure } from '../procedures';

// Local constants for schema defaults and boundaries
const USERS_DEFAULT_LIMIT = 100 as const;
const USERS_DEFAULT_OFFSET = 0 as const;
const USERS_MIN_LIMIT = 1 as const;
const USERS_MAX_LIMIT = 100 as const;
const USERS_MIN_OFFSET = 0 as const;

export const usersRouter = {
  // Get all users in the current organization
  getOrganizationUsers: adminOnlyProcedure
    .input(
      z.object({
        limit: z
          .number()
          .min(USERS_MIN_LIMIT)
          .max(USERS_MAX_LIMIT)
          .default(USERS_DEFAULT_LIMIT),
        offset: z.number().min(USERS_MIN_OFFSET).default(USERS_DEFAULT_OFFSET),
      }),
    )
    .handler(async ({ input, context }) => {
      const { limit, offset } = input;

      if (!context.team) {
        throw new ORPCError('NOT_FOUND');
      }

      const organizationUsers = await context.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: member.role,
          createdAt: user.createdAt,
          lastActiveAt: user.lastActiveAt,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(
          eq(
            member.organizationId,
            context.session.session.activeOrganizationId,
          ),
        )
        .limit(limit)
        .offset(offset);

      // Transform to match the client User interface
      const STATUS_ONLINE = 'online' as const;
      const AVATAR_BASE = 'https://api.dicebear.com/9.x/glass/svg?seed=';

      const transformedUsers = organizationUsers.map((orgUser) => {
        return {
          id: orgUser.id,
          name: orgUser.name || 'Unknown User',
          avatarUrl: orgUser.image || `${AVATAR_BASE}${orgUser.id}`,
          email: orgUser.email,
          status: STATUS_ONLINE,
          role: orgUser.role,
          joinedDate: orgUser.createdAt.toISOString().split('T')[0],
          teamIds: [],
        };
      });

      return {
        users: transformedUsers,
        organizationId: context.session.session.activeOrganizationId,
        total: transformedUsers.length, // Could be enhanced with actual count query
      };
    }),

  // Bulk invite users to the organization (and optionally to a team)
  inviteUsers: adminOnlyProcedure
    .input(
      z.object({
        users: z
          .array(
            z.object({
              email: z.string().email('Invalid email address'),
              role: z.enum(['member', 'admin', 'owner']).default('member'),
              teamId: z.string().optional(),
            }),
          )
          .min(1, 'At least one user must be provided')
          .max(50, 'Cannot invite more than 50 users at once'),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!context.team) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      const auth = getAuth(context.env);

      // Process all invitations in parallel
      const invitationPromises = input.users.map(async (invitee) => {
        // Use better-auth's API to create the invitation
        // This will also trigger the sendInvitationEmail hook automatically
        await auth.api.createInvitation({
          headers: context.headers,
          body: {
            email: invitee.email,
            role: invitee.role,
            organizationId: context.session.session.activeOrganizationId,
            inviterId: context.session.user.id,
            teamId: invitee.teamId,
          },
        });
        return invitee.email;
      });

      const settledResults = await Promise.allSettled(invitationPromises);

      // Map results to our response format
      const results = settledResults.map((result, index) => {
        const email = input.users[index].email;
        if (result.status === 'fulfilled') {
          return { email, status: 'success' as const };
        }
        return {
          email,
          status: 'failed' as const,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error occurred',
        };
      });

      const successCount = settledResults.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      const failedCount = settledResults.filter(
        (r) => r.status === 'rejected',
      ).length;

      return {
        results,
        summary: {
          total: input.users.length,
          success: successCount,
          failed: failedCount,
        },
      };
    }),
};
