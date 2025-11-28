import { ORPCError } from '@orpc/server';
import { getPublicBoards } from '@/dal/boards';
import { teamProcedure } from '../procedures';

export const boardsRouter = {
  getAll: teamProcedure.handler(async ({ context }) => {
    try {
      const publicBoards = await getPublicBoards(
        context.db,
        context.team?.id || '',
      );

      return {
        boards: publicBoards,
        teamId: context.team?.id || '',
        teamName: context.team?.name || '',
      };
    } catch (_error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR');
    }
  }),
};
