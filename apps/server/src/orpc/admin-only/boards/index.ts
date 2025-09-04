import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { boards } from '../../../db/schema/boards';
import { adminOnlyProcedure } from '../../procedures';

export const boardsRouter = {
  getAll: adminOnlyProcedure.handler(async ({ context }) => {
    if (!context.organization?.id) {
      throw new Error('Organization not found');
    }
    const allBoards = await context.db
      .select()
      .from(boards)
      .where(eq(boards.organizationId, context.organization.id));
    return allBoards;
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
      const boardId = crypto.randomUUID();
      const [newBoard] = await context.db
        .insert(boards)
        .values({
          id: boardId,
          organizationId: context.organization.id,
          name: input.name,
          slug: input.slug,
          description: input.description,
          isPrivate: input.isPrivate,
        })
        .returning();
      return newBoard;
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
      const [updatedBoard] = await context.db
        .update(boards)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.slug && { slug: input.slug }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
          updatedAt: new Date(),
        })
        .where(eq(boards.id, input.id))
        .returning();
      if (!updatedBoard) {
        throw new Error('Board not found');
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
      const [deletedBoard] = await context.db
        .delete(boards)
        .where(eq(boards.id, input.id))
        .returning();
      if (!deletedBoard) {
        throw new Error('Board not found');
      }
      return { success: true, deletedBoard };
    }),
};
