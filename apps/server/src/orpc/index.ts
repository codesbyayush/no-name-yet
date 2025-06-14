import { publicProcedure, protectedProcedure } from "./procedures";
import { z } from "zod";
import { db } from "../db";
import { boards } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

export const apiRouter = {
  // Health check - public endpoint
  healthCheck: publicProcedure.handler(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    };
  }),

  // Get current user - protected endpoint
  getCurrentUser: protectedProcedure.handler(({ context }) => {
    return {
      user: context.session?.user,
      sessionId: context.session?.session?.id,
    };
  }),

  // Example with input validation
  echo: publicProcedure
    .input(
      z.object({
        message: z.string(),
      }),
    )
    .handler(({ input }) => {
      return {
        echo: input.message,
        timestamp: new Date().toISOString(),
      };
    }),

  // Protected endpoint with input
  createPrivateNote: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string(),
      }),
    )
    .handler(({ input, context }) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: input.title,
        content: input.content,
        authorId: context.session?.user?.id,
        createdAt: new Date().toISOString(),
      };
    }),

  // Get all public boards for the current organization
  getAllPublicBoards: publicProcedure.handler(async ({ context }) => {
    // Check if organization exists
    if (!context.organization) {
      throw new ORPCError("NOT_FOUND");
    }

    try {
      // Fetch all public boards for the organization
      const publicBoards = await db
        .select({
          id: boards.id,
          name: boards.name,
          slug: boards.slug,
          description: boards.description,
          postCount: boards.postCount,
          viewCount: boards.viewCount,
          createdAt: boards.createdAt,
          updatedAt: boards.updatedAt,
        })
        .from(boards)
        .where(
          and(
            eq(boards.organizationId, context.organization.id),
            eq(boards.isPrivate, false),
          ),
        )
        .orderBy(asc(boards.createdAt));

      return {
        boards: publicBoards,
        organizationId: context.organization.id,
        organizationName: context.organization.name,
      };
    } catch (error) {
      console.error("Error fetching public boards:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }
  }),
};

export type AppRouter = typeof apiRouter;
