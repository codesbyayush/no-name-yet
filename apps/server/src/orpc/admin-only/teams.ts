import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import {
  createTeamWithMember,
  getTeamMembersWithDetails,
} from '@/services/teams';
import { adminOnlyProcedure } from '../procedures';

export const teamsRouter = {
  // Get all team members for a specific team with user details
  getTeamMembers: adminOnlyProcedure
    .input(
      z
        .object({
          teamId: z.string().min(1, 'Team ID is required'),
        })
        .optional(),
    )
    .handler(async ({ input, context }) => {
      if (!context.team) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      const teamId = input?.teamId || context.team.id;

      if (!teamId) {
        throw new ORPCError('BAD_REQUEST', { message: 'Team ID is required' });
      }

      // Use service layer
      const result = await getTeamMembersWithDetails(
        context.db,
        teamId,
        context.session.session.activeOrganizationId,
      );

      return result;
    }),

  createTeam: adminOnlyProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Team name is required'),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!context.team) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      // Use service layer
      const result = await createTeamWithMember(
        context.env,
        input.name,
        context.session.session.activeOrganizationId,
        context.session.session.userId,
        context.headers,
      );

      return result;
    }),
};
