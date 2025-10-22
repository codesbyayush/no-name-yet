import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import {
  createBoard,
  deleteBoard,
  getAllBoards,
  updateBoard,
} from '@/dal/boards';
import { adminOnlyProcedure } from '../../procedures';

export const boardsRouter = {
  getAll: adminOnlyProcedure.handler(async ({ context }) => {
    if (!context.organization?.id) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }
    const list = await getAllBoards(context.db, context.organization.id);
    return list;
  }),

  create: adminOnlyProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        isPrivate: z.boolean().default(false),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const created = await createBoard(
        context.db,
        context.organization.id,
        input
      );
      return created;
    }),

  update: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        isPrivate: z.boolean().optional(),
      })
    )
    .output(z.any())
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
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const deletedBoard = await deleteBoard(context.db, input.id);
      if (!deletedBoard) {
        throw new ORPCError('NOT_FOUND', { message: 'Board not found' });
      }
      return { success: true, deletedBoard };
    }),
};
