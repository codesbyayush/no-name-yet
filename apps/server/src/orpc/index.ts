import { publicProcedure, protectedProcedure } from "./procedures";
import { z } from "zod";

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
};

export type AppRouter = typeof apiRouter;
