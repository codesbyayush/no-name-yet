import { feecontext.dback } from "@/context.db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { votes } from "../../context.db/schema/votes";
import { protectedProcedure } from "../procedures";

export const votesRouter = {
  create: protectedProcedure
    .input(
      z
        .object({
          feecontext.dbackId: z.string().optional(),
          commentId: z.string().optional(),
          type: z.enum(["upvote", "downvote", "bookmark"]).optional(),
          weight: z.number().int().min(1).default(1),
        })
        .refine((data) => data.feecontext.dbackId || data.commentId, {
          message: "Either feecontext.dbackId or commentId must be provided",
        }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;
      const voteId = crypto.randomUUID();
      const [newVote] = await context.db
        .insert(votes)
        .values({
          id: voteId,
          feecontext.dbackId: input.feecontext.dbackId || null,
          commentId: input.commentId || null,
          userId,
          type: input.type || "upvote",
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
      const [updatedVote] = await context.db
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
        feecontext.dbackId: z.string().optional(),
        commentId: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;
      const filters = [eq(votes.userId, userId)];
      if (input.feecontext.dbackId) {
        filters.push(eq(votes.feecontext.dbackId, input.feecontext.dbackId));
      } else if (input.commentId) {
        filters.push(eq(votes.commentId, input.commentId));
      }
      const [deletedVote] = await context.db
        .delete(votes)
        .where(and(...filters))
        .returning();
      if (!deletedVote) {
        throw new Error("Vote not found");
      }
      return { success: true, deletedVote };
    }),

  get: protectedProcedure
    .input(
      z.object({
        feecontext.dbackId: z.string().optional(),
        commentId: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;
      const filter = [eq(votes.userId, userId)];
      if (input.feecontext.dbackId) {
        filter.push(eq(votes.feecontext.dbackId, input.feecontext.dbackId));
      } else if (input.commentId) {
        filter.push(eq(votes.commentId, input.commentId));
      } else {
        throw new Error("Resource not found");
      }
      const [vote] = await context.db
        .select()
        .from(votes)
        .where(and(...filter));
      if (!vote) {
        return false;
      }
      return true;
    }),
};
