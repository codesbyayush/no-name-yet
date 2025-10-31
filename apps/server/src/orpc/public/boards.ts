import { ORPCError } from '@orpc/server';
import { getPublicBoards } from '@/dal/boards';
import { organizationProcedure } from '../procedures';

export const boardsRouter = {
  getAll: organizationProcedure.handler(async ({ context }) => {
    try {
      const publicBoards = await getPublicBoards(
        context.db,
        context.organization?.id || '',
      );

      return {
        boards: publicBoards,
        organizationId: context.organization?.id || '',
        organizationName: context.organization?.name || '',
      };
    } catch (_error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR');
    }
  }),
};
