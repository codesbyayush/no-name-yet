import { ORPCError } from '@orpc/server';
import { and, asc, eq } from 'drizzle-orm';
import { boards } from '@/db/schema/boards';
import { organizationProcedure } from '../procedures';

export const boardsRouter = {
  getAll: organizationProcedure.handler(async ({ context }) => {
    try {
      const publicBoards = await context.db
        .select({
          id: boards.id,
          name: boards.name,
          slug: boards.slug,
          description: boards.description,
        })
        .from(boards)
        .where(
          and(
            eq(boards.organizationId, context.organization?.id || ''),
            eq(boards.isPrivate, false)
          )
        )
        .orderBy(asc(boards.createdAt));

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
