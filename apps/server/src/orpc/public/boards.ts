import { ORPCError } from '@orpc/server';
import { getTeamPublicBoards } from '@/services/boards';
import { teamProcedure } from '../procedures';

export const boardsRouter = {
  getAll: teamProcedure.handler(async ({ context }) => {
    if (!context.team?.id) {
      throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
    }

    const publicBoards = await getTeamPublicBoards(context.db, context.team.id);

    return {
      boards: publicBoards,
      teamId: context.team.id,
      teamName: context.team.name ?? '',
    };
  }),
};
