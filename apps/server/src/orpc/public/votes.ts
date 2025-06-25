import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "../procedures";
import { db } from "../../db";
import {
  votes,
  voteTypeEnum,
  type Vote,
  type NewVote,
} from "../../db/schema/votes";

export const votesRouter = {
  create: protectedProcedure
    .input(
      z
        .object({
          feedbackId: z.string().optional(),
          commentId: z.string().optional(),
          type: z.enum(["upvote", "downvote", "bookmark"]),
          weight: z.number().int().min(1).default(1),
        })
        .refine((data) => data.feedbackId || data.commentId, {
          message: "Either feedbackId or commentId must be provided",
        }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      const voteId = crypto.randomUUID();

      const [newVote] = await db
        .insert(votes)
        .values({
          id: voteId,
          feedbackId: input.feedbackId || null,
          commentId: input.commentId || null,
          userId,
          type: input.type,
          weight: input.weight,
        })
        .returning();

      return newVote;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["upvote", "downvote", "bookmark"]).optional(),
        weight: z.number().int().min(1).optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      const [updatedVote] = await db
        .update(votes)
        .set({
          ...(input.type && { type: input.type }),
          ...(input.weight && { weight: input.weight }),
        })
        .where(eq(votes.id, input.id))
        .returning();

      if (!updatedVote) {
        throw new Error("Vote not found");
      }

      return updatedVote;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      const [deletedVote] = await db
        .delete(votes)
        .where(eq(votes.id, input.id))
        .returning();

      if (!deletedVote) {
        throw new Error("Vote not found");
      }

      return { success: true, deletedVote };
    }),
};
