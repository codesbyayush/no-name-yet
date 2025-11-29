import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { pagination, rateLimits } from '@/config';
import { getOrganizationUsers, inviteUsers } from '@/services/users';
import { adminOnlyProcedure } from '../procedures';

export const usersRouter = {
  getOrganizationUsers: adminOnlyProcedure
    .input(
      z.object({
        limit: z
          .number()
          .min(pagination.minLimit)
          .max(pagination.maxLimit)
          .default(pagination.maxLimit),
        offset: z.number().min(0).default(pagination.defaultOffset),
      }),
    )
    .handler(async ({ input, context }) => {
      const { limit, offset } = input;

      if (!context.team) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      return await getOrganizationUsers(
        context.db,
        context.session.session.activeOrganizationId,
        limit,
        offset,
      );
    }),

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
          .max(
            rateLimits.maxBulkInvites,
            `Cannot invite more than ${rateLimits.maxBulkInvites} users at once`,
          ),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!context.team) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      return await inviteUsers(
        context.env,
        context.headers,
        context.session.session.activeOrganizationId,
        context.session.user.id,
        input.users,
      );
    }),
};
