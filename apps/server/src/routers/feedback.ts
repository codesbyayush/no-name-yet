import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { feedback } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import {
  getCurrentUser,
  getCurrentTenant,
  getTenantId,
  requireTenant,
} from "../middleware/utils";

const feedbackRouter = new Hono();

// Validation schemas
const submitFeedbackSchema = z.object({
  type: z.enum(["bug", "suggestion"]),
  title: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),

  // Technical context
  userAgent: z.string().optional(),
  url: z.string().url().optional(),
  browserInfo: z
    .object({
      platform: z.string().optional(),
      language: z.string().optional(),
      cookieEnabled: z.boolean().optional(),
      onLine: z.boolean().optional(),
      screenResolution: z.string().optional(),
    })
    .optional(),

  // Attachments (for now, just metadata - file upload in Phase 4)
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
    .optional()
    .default([]),

  // Additional metadata
  isAnonymous: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

const getFeedbackSchema = z.object({
  type: z.enum(["bug", "suggestion"]).optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  limit: z.string().transform(Number).optional().default("50"),
  offset: z.string().transform(Number).optional().default("0"),
});

// POST /api/feedback/submit - Submit new feedback
feedbackRouter.post(
  "/submit",
  requireTenant,
  zValidator("json", submitFeedbackSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const user = getCurrentUser(c);
      const tenant = getCurrentTenant(c);

      // Insert feedback with user and tenant context from middleware
      const result = await db
        .insert(feedback)
        .values({
          tenantId: tenant!.id,
          type: data.type,
          title: data.title,
          description: data.description,
          severity: data.severity,
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.name,
          userAgent: data.userAgent || c.req.header("User-Agent"),
          url: data.url,
          browserInfo: data.browserInfo,
          attachments: data.attachments,
          isAnonymous: data.isAnonymous || !user,
          tags: data.tags,
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "Feedback submitted successfully",
          feedback: result[0],
        },
        201,
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to submit feedback",
        },
        500,
      );
    }
  },
);

// GET /api/feedback - Get feedback for a tenant
feedbackRouter.get(
  "/",
  requireTenant,
  zValidator("query", getFeedbackSchema),
  async (c) => {
    try {
      const { type, status, limit, offset } = c.req.valid("query");
      const tenantId = getTenantId(c);

      // Build query conditions
      let whereConditions = eq(feedback.tenantId, tenantId!);

      // Add optional filters
      const conditions = [whereConditions];
      if (type) {
        conditions.push(eq(feedback.type, type));
      }
      if (status) {
        conditions.push(eq(feedback.status, status));
      }

      // Fetch feedback with pagination
      const feedbackList = await db.query.feedback.findMany({
        where: conditions.length > 1 ? undefined : whereConditions, // TODO: Use and() for multiple conditions
        orderBy: desc(feedback.createdAt),
        limit: limit,
        offset: offset,
      });

      // Get total count for pagination
      const totalCount = await db.query.feedback.findMany({
        where: whereConditions,
        columns: { id: true },
      });

      return c.json({
        success: true,
        data: feedbackList,
        pagination: {
          total: totalCount.length,
          limit,
          offset,
          hasMore: totalCount.length > offset + limit,
        },
      });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to fetch feedback",
        },
        500,
      );
    }
  },
);

// GET /api/feedback/:id - Get specific feedback by ID
feedbackRouter.get("/:id", requireTenant, async (c) => {
  try {
    const feedbackId = parseInt(c.req.param("id"));
    const tenantId = getTenantId(c);

    if (isNaN(feedbackId)) {
      return c.json(
        {
          error: "Invalid feedback ID",
          message: "Feedback ID must be a number",
        },
        400,
      );
    }

    const feedbackItem = await db.query.feedback.findFirst({
      where: eq(feedback.id, feedbackId),
    });

    if (!feedbackItem) {
      return c.json(
        {
          error: "Feedback not found",
          message: "The specified feedback does not exist",
        },
        404,
      );
    }

    // Ensure feedback belongs to current tenant
    if (feedbackItem.tenantId !== tenantId) {
      return c.json(
        {
          error: "Forbidden",
          message: "Feedback does not belong to your tenant",
        },
        403,
      );
    }

    return c.json({
      success: true,
      data: feedbackItem,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch feedback",
      },
      500,
    );
  }
});

// POST /api/feedback/:id/status - Update feedback status
feedbackRouter.post(
  "/:id/status",
  requireTenant,
  zValidator(
    "json",
    z.object({
      status: z.enum(["open", "in_progress", "resolved", "closed"]),
    }),
  ),
  async (c) => {
    try {
      const feedbackId = parseInt(c.req.param("id"));
      const { status } = c.req.valid("json");
      const tenantId = getTenantId(c);

      if (isNaN(feedbackId)) {
        return c.json(
          {
            error: "Invalid feedback ID",
            message: "Feedback ID must be a number",
          },
          400,
        );
      }

      // First check if feedback exists and belongs to tenant
      const existingFeedback = await db.query.feedback.findFirst({
        where: eq(feedback.id, feedbackId),
      });

      if (!existingFeedback) {
        return c.json(
          {
            error: "Feedback not found",
            message: "The specified feedback does not exist",
          },
          404,
        );
      }

      if (existingFeedback.tenantId !== tenantId) {
        return c.json(
          {
            error: "Forbidden",
            message: "Feedback does not belong to your tenant",
          },
          403,
        );
      }

      const result = await db
        .update(feedback)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(feedback.id, feedbackId))
        .returning();

      return c.json({
        success: true,
        message: "Feedback status updated successfully",
        feedback: result[0],
      });
    } catch (error) {
      console.error("Error updating feedback status:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to update feedback status",
        },
        500,
      );
    }
  },
);

export { feedbackRouter };
