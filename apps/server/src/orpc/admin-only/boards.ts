import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import {
  createBoard,
  deleteBoard,
  getTeamBoards,
  updateBoard,
} from '@/services/boards';
import { adminOnlyProcedure } from '../procedures';

export const boardsRouter = {
  getAll: adminOnlyProcedure.handler(async ({ context }) => {
    if (!context.team?.id) {
      throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
    }

    const list = await getTeamBoards(context.db, context.team.id);
    return list;
  }),

  create: adminOnlyProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        isPrivate: z.boolean().default(false),
        customFields: z.any().optional(),
      }),
    )

    .handler(async ({ input, context }) => {
      if (!context.team?.id) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }
      return await createBoard(context.db, context.team.id, input);
    }),

  update: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        isPrivate: z.boolean().optional(),
      }),
    )

    .handler(async ({ input, context }) => {
      const updatedBoard = await updateBoard(context.db, input);
      if (!updatedBoard) {
        throw new ORPCError('NOT_FOUND', { message: 'Board not found' });
      }
      return updatedBoard;
    }),

  delete: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )

    .handler(async ({ input, context }) => {
      const deletedBoard = await deleteBoard(context.db, input.id);
      if (!deletedBoard) {
        throw new ORPCError('NOT_FOUND', { message: 'Board not found' });
      }
      return { success: true, deletedBoard };
    }),
};
