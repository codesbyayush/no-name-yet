import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { feedback, tenants } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const feedbackRouter = new Hono();

// Validation schemas
const submitFeedbackSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  type: z.enum(["bug", "suggestion"]),
  title: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  
  // User context (will come from JWT in Phase 3, manual for now)
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  
  // Technical context
  userAgent: z.string().optional(),
  url: z.string().url().optional(),
  browserInfo: z.object({
    platform: z.string().optional(),
    language: z.string().optional(),
    cookieEnabled: z.boolean().optional(),
    onLine: z.boolean().optional(),
    screenResolution: z.string().optional(),
  }).optional(),
  
  // Attachments (for now, just metadata - file upload in Phase 4)
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string(),
  })).optional().default([]),
  
  // Additional metadata
  isAnonymous: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

const getFeedbackSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  type: z.enum(["bug", "suggestion"]).optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  limit: z.string().transform(Number).optional().default(50),
  offset: z.string().transform(Number).optional().default(0),
});

// POST /api/feedback/submit - Submit new feedback
feedbackRouter.post(
  "/submit",
  zValidator("json", submitFeedbackSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      
      // Verify tenant exists (basic validation for Phase 2)
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, data.tenantId),
      });
      
      if (!tenant) {
        return c.json({ 
          error: "Invalid tenant ID",
          message: "The specified tenant does not exist or is inactive"
        }, 400);
      }
      
      // Insert feedback
      const result = await db.insert(feedback).values({
        tenantId: data.tenantId,
        type: data.type,
        title: data.title,
        description: data.description,
        severity: data.severity,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        userAgent: data.userAgent,
        url: data.url,
        browserInfo: data.browserInfo,
        attachments: data.attachments,
        isAnonymous: data.isAnonymous,
        tags: data.tags,
      }).returning();
      
      return c.json({ 
        success: true,
        message: "Feedback submitted successfully",
        feedback: result[0]
      }, 201);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return c.json({ 
        error: "Internal server error",
        message: "Failed to submit feedback"
      }, 500);
    }
  }
);

// GET /api/feedback - Get feedback for a tenant
feedbackRouter.get(
  "/",
  zValidator("query", getFeedbackSchema),
  async (c) => {
    try {
      const { tenantId, type, status, limit, offset } = c.req.valid("query");
      
      // Build query conditions
      let whereConditions = eq(feedback.tenantId, tenantId);
      
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
      return c.json({ 
        error: "Internal server error",
        message: "Failed to fetch feedback"
      }, 500);
    }
  }
);

// GET /api/feedback/:id - Get specific feedback by ID
feedbackRouter.get("/:id", async (c) => {
  try {
    const feedbackId = parseInt(c.req.param("id"));
    
    if (isNaN(feedbackId)) {
      return c.json({ 
        error: "Invalid feedback ID",
        message: "Feedback ID must be a number"
      }, 400);
    }
    
    const feedbackItem = await db.query.feedback.findFirst({
      where: eq(feedback.id, feedbackId),
    });
    
    if (!feedbackItem) {
      return c.json({ 
        error: "Feedback not found",
        message: "The specified feedback does not exist"
      }, 404);
    }
    
    return c.json({
      success: true,
      data: feedbackItem,
    });
    
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return c.json({ 
      error: "Internal server error",
      message: "Failed to fetch feedback"
    }, 500);
  }
});

// POST /api/feedback/:id/status - Update feedback status
feedbackRouter.post("/:id/status", 
  zValidator("json", z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
  })),
  async (c) => {
    try {
      const feedbackId = parseInt(c.req.param("id"));
      const { status } = c.req.valid("json");
      
      if (isNaN(feedbackId)) {
        return c.json({ 
          error: "Invalid feedback ID",
          message: "Feedback ID must be a number"
        }, 400);
      }
      
      const result = await db
        .update(feedback)
        .set({ 
          status,
          updatedAt: new Date(),
        })
        .where(eq(feedback.id, feedbackId))
        .returning();
      
      if (result.length === 0) {
        return c.json({ 
          error: "Feedback not found",
          message: "The specified feedback does not exist"
        }, 404);
      }
      
      return c.json({
        success: true,
        message: "Feedback status updated successfully",
        feedback: result[0],
      });
      
    } catch (error) {
      console.error("Error updating feedback status:", error);
      return c.json({ 
        error: "Internal server error",
        message: "Failed to update feedback status"
      }, 500);
    }
  }
);

export { feedbackRouter };