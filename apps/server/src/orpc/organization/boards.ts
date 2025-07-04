import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "../procedures";
import { db } from "../../db";
import {
  boards,
  type Board,
  type NewBoard,
} from "../../db/schema/boards";

export const boardsRouter = {
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        isPrivate: z.boolean().default(false),
        customFields: z.any().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const boardId = crypto.randomUUID();

      const [newBoard] = await db
        .insert(boards)
        .values({
          id: boardId,
          organizationId: input.organizationId,
          name: input.name,
          slug: input.slug,
          description: input.description,
          isPrivate: input.isPrivate,
          customFields: input.customFields,
        })
        .returning();

      return newBoard;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        isPrivate: z.boolean().optional(),
        customFields: z.any().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const [updatedBoard] = await db
        .update(boards)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.slug && { slug: input.slug }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
          ...(input.customFields && { customFields: input.customFields }),
          updatedAt: new Date(),
        })
        .where(eq(boards.id, input.id))
        .returning();

      if (!updatedBoard) {
        throw new Error("Board not found");
      }

      return updatedBoard;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const [deletedBoard] = await db
        .delete(boards)
        .where(eq(boards.id, input.id))
        .returning();

      if (!deletedBoard) {
        throw new Error("Board not found");
      }

      return { success: true, deletedBoard };
    }),
};
