import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { member, user } from '@/db/schema';
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
      })
    )
    .handler(async ({ input, context }) => {
      const { limit, offset } = input;

      if (!context.organization) {
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
        .where(eq(member.organizationId, context.organization.id))
        .limit(limit)
        .offset(offset);

      // Transform to match the client User interface
      const STATUS_ONLINE = 'online' as const;
      const AVATAR_BASE = 'https://api.dicebear.com/9.x/glass/svg?seed=';

      const transformedUsers = organizationUsers.map((orgUser) => {
        let roleLabel: 'Member' | 'Admin' | 'Guest';
        if (orgUser.role === 'admin') {
          roleLabel = 'Admin';
        } else if (orgUser.role === 'member') {
          roleLabel = 'Member';
        } else {
          roleLabel = 'Guest';
        }
        return {
          id: orgUser.id,
          name: orgUser.name || 'Unknown User',
          avatarUrl: orgUser.image || `${AVATAR_BASE}${orgUser.id}`,
          email: orgUser.email,
          status: STATUS_ONLINE,
          role: roleLabel,
          joinedDate: orgUser.createdAt.toISOString().split('T')[0],
          teamIds: [],
        };
      });

      return {
        users: transformedUsers,
        organizationId: context.organization.id,
        total: transformedUsers.length, // Could be enhanced with actual count query
      };
    }),
};
