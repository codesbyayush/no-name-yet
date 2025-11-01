import { ORPCError } from '@orpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { team, teamMember, user } from '@/db/schema';
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
      if (!context.organization) {
        throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
      }

      const teamId = input?.teamId || context.session.session.activeTeamId;

      if (!teamId) {
        throw new ORPCError('BAD_REQUEST', { message: 'Team ID is required' });
      }

      const teamData = await context.db
        .select()
        .from(team)
        .where(
          and(
            eq(team.id, teamId),
            eq(
              team.organizationId,
              context.session.session.activeOrganizationId,
            ),
          ),
        )
        .limit(1);

      if (teamData.length === 0) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      const members = await context.db
        .select({
          memberId: teamMember.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt,
          lastActiveAt: user.lastActiveAt,
          joinedTeamAt: teamMember.createdAt,
        })
        .from(teamMember)
        .innerJoin(user, eq(teamMember.userId, user.id))
        .where(eq(teamMember.teamId, teamId));

      return {
        teamId,
        members,
        teamName: teamData[0].name,
        totalMembers: members.length,
      };
    }),
};
