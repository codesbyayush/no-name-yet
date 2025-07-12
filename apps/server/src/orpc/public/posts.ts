import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  type Feedback,
  type NewFeedback,
  feedback,
  feedbackTypeEnum,
  statusEnum,
} from "../../db/schema/feedback";
import { protectedProcedure } from "../procedures";

export const postsRouter = {
  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        type: z.enum(["bug", "suggestion"]).default("bug"),
        title: z.string().optional(),
        description: z.string().min(1),
        url: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).default("low"),
        tags: z.array(z.string()).default([]),
        userAgent: z.string().optional(),
        browserInfo: z
          .object({
            platform: z.string().optional(),
            language: z.string().optional(),
            cookieEnabled: z.boolean().optional(),
            onLine: z.boolean().optional(),
            screenResolution: z.string().optional(),
          })
          .optional(),
        attachments: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              type: z.string(),
              size: z.number(),
              url: z.string(),
            }),
          )
          .default([]),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;
      const userEmail = context.session!.user.email;
      const userName = context.session!.user.name;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        const [newPost] = await context.db
          .insert(feedback)
          .values({
            boardId: input.boardId,
            type: input.type,
            title: input.title,
            description: input.description,
            userId,
            userEmail,
            userName,
            userAgent: input.userAgent,
            url: input.url,
            priority: input.priority,
            tags: input.tags,
            browserInfo: input.browserInfo,
            attachments: input.attachments,
            isAnonymous: false,
          })
          .returning();

        return newPost;
      } catch (error) {
        console.error(error);
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().min(1).optional(),
        status: z
          .enum(["open", "in_progress", "resolved", "closed"])
          .optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        tags: z.array(z.string()).optional(),
        url: z.string().optional(),
        userAgent: z.string().optional(),
        browserInfo: z
          .object({
            platform: z.string().optional(),
            language: z.string().optional(),
            cookieEnabled: z.boolean().optional(),
            onLine: z.boolean().optional(),
            screenResolution: z.string().optional(),
          })
          .optional(),
        attachments: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              type: z.string(),
              size: z.number(),
              url: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      const [updatedPost] = await context.db
        .update(feedback)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.description && { description: input.description }),
          ...(input.status && { status: input.status }),
          ...(input.priority && { priority: input.priority }),
          ...(input.tags && { tags: input.tags }),
          ...(input.url && { url: input.url }),
          ...(input.userAgent && { userAgent: input.userAgent }),
          ...(input.browserInfo && { browserInfo: input.browserInfo }),
          ...(input.attachments && { attachments: input.attachments }),
          updatedAt: new Date(),
        })
        .where(eq(feedback.id, input.id))
        .returning();

      if (!updatedPost) {
        throw new Error("Post not found");
      }

      return updatedPost;
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

      const [deletedPost] = await context.db
        .delete(feedback)
        .where(eq(feedback.id, input.id))
        .returning();

      if (!deletedPost) {
        throw new Error("Post not found");
      }

      return { success: true, deletedPost };
    }),
};
