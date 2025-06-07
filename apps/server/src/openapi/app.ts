import { OpenAPIHono } from "@hono/zod-openapi";
import {
  submitFeedbackRoute,
  getFeedbackRoute,
  getFeedbackByIdRoute,
  updateFeedbackStatusRoute,
} from "./routes";
import {
  createTenantRoute,
  getTenantsRoute,
  getTenantByIdRoute,
  updateTenantRoute,
  deleteTenantRoute,
  activateTenantRoute,
} from "./tenant-routes";
import {
  createBoardRoute,
  getBoardsRoute,
  getBoardByIdRoute,
  getBoardBySlugRoute,
  updateBoardRoute,
  deleteBoardRoute,
  restoreBoardRoute,
  getPublicBoardsRoute,
  getBoardStatsRoute,
  searchBoardsRoute,
} from "./board-routes";
import {
  createUserRoute,
  getUsersRoute,
  getUserByIdRoute,
  updateUserRoute,
  deleteUserRoute,
  getUsersByTenantRoute,
  updateUserRoleRoute,
  getUserStatsRoute,
  searchUsersRoute,
} from "./user-routes";
import {
  createPostRoute,
  getPostsRoute,
  getPostByIdRoute,
  getPostBySlugRoute,
  updatePostRoute,
  deletePostRoute,
  updatePostSentimentRoute,
  getPostsByBoardRoute,
  getPostStatsRoute,
  searchPostsRoute,
} from "./post-routes";
import {
  createCommentRoute,
  getCommentsRoute,
  getCommentByIdRoute,
  updateCommentRoute,
  deleteCommentRoute,
  getCommentsByPostRoute,
  getCommentStatsRoute,
  createVoteRoute,
  updateVoteRoute,
  deleteVoteRoute,
  getVotesByPostRoute,
  getVotesByCommentRoute,
  getVoteCountsRoute,
  getUserVoteRoute,
} from "./comment-vote-routes";
import {
  createCustomFieldRoute,
  getCustomFieldsRoute,
  getCustomFieldByIdRoute,
  updateCustomFieldRoute,
  deleteCustomFieldRoute,
  setCustomFieldValueRoute,
  getCustomFieldValuesRoute,
  createIntegrationRoute,
  getIntegrationsRoute,
  getIntegrationByIdRoute,
  updateIntegrationRoute,
  deleteIntegrationRoute,
  testIntegrationRoute,
  syncIntegrationRoute,
  createPostIntegrationRoute,
  getPostIntegrationsRoute,
} from "./custom-integration-routes";
import { db } from "../db";
import { feedback, tenants } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { BoardFunctions } from "../functions/boards";
import { UserFunctions } from "../functions/users";
import { PostFunctions } from "../functions/posts";
import { CommentFunctions } from "../functions/comments";
import { VoteFunctions } from "../functions/votes";
import { CustomFieldFunctions } from "../functions/custom-fields";
import { IntegrationFunctions } from "../functions/integrations";

export const openAPIApp = new OpenAPIHono();

// OpenAPI configuration
openAPIApp.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "2.0.0",
    title: "OmniFeedback API",
    description: `
# OmniFeedback API Documentation

A comprehensive multi-tenant feedback and content management API built with modern technologies.

## 🚀 Features

- **Multi-tenant architecture** with row-level security
- **Enhanced authentication** with role-based access control
- **AI-ready content system** with sentiment analysis and vector embeddings
- **Hierarchical commenting** with nested replies
- **Intelligent voting system** with weighted votes
- **Custom fields system** for flexible data modeling
- **Third-party integrations** (Jira, Salesforce, Slack, Zendesk)
- **Real-time statistics** and analytics

## 🔒 Authentication

Most endpoints require authentication via the Better Auth system. Include the authorization header in your requests:

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## 🏢 Multi-Tenancy

All endpoints (except auth) require a \`tenantId\` parameter to ensure data isolation. Each tenant's data is completely separated at the database level.

## 📊 Response Format

### Success Response
\`\`\`json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully",
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
\`\`\`

## 🎯 Status Codes

- \`200\` - Success
- \`201\` - Created
- \`400\` - Bad Request
- \`404\` - Not Found
- \`409\` - Conflict
- \`500\` - Internal Server Error
    `,
    contact: {
      name: "OmniFeedback API Support",
      email: "support@omnifeedback.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Development server",
    },
    {
      url: "https://api.omnifeedback.com",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication and session management",
    },
    {
      name: "Tenants",
      description: "Multi-tenant organization management",
    },
    {
      name: "Users",
      description: "User management with role-based access control",
    },
    {
      name: "Boards",
      description: "Hierarchical content organization boards",
    },
    {
      name: "Posts",
      description: "AI-ready content posts with sentiment analysis",
    },
    {
      name: "Comments",
      description: "Nested comment threading system",
    },
    {
      name: "Votes",
      description: "Intelligent weighted voting system",
    },
    {
      name: "Custom Fields",
      description: "Dynamic custom field management",
    },
    {
      name: "Integrations",
      description: "Third-party service integrations",
    },
    {
      name: "Feedback",
      description: "Legacy feedback submission system",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error type",
          },
          message: {
            type: "string",
            description: "Detailed error message",
          },
        },
        required: ["error", "message"],
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates if the operation was successful",
          },
          message: {
            type: "string",
            description: "Success message",
          },
        },
        required: ["success"],
      },
      Pagination: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of items per page",
          },
          offset: {
            type: "number",
            description: "Number of items skipped",
          },
          total: {
            type: "number",
            description: "Total number of items",
          },
          hasMore: {
            type: "boolean",
            description: "Whether there are more items available",
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
});

// Custom Swagger UI HTML page
openAPIApp.get("/docs", (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OmniFeedback API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/doc',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                defaultModelRendering: "model",
                defaultModelsExpandDepth: 2,
                defaultModelExpandDepth: 2,
                displayOperationId: false,
                displayRequestDuration: true,
                docExpansion: "list",
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                validatorUrl: null,
                oauth2RedirectUrl: window.location.origin + '/api/docs/oauth2-redirect.html'
            });
        };
    </script>
</body>
</html>`;

  return c.html(html);
});

// OAuth2 redirect handler for Swagger UI
openAPIApp.get("/docs/oauth2-redirect.html", (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en-US">
<head>
    <title>Swagger UI: OAuth2 Redirect</title>
</head>
<body>
<script src="https://unpkg.com/swagger-ui-dist@5.9.0/oauth2-redirect.html"></script>
</body>
</html>`;

  return c.html(html);
});

// Root redirect to docs for convenience
openAPIApp.get("/", (c) => {
  return c.redirect("/api/docs");
});

// Health check endpoint with OpenAPI spec
openAPIApp.openapi(
  {
    method: "get",
    path: "/health",
    tags: ["System"],
    summary: "Health check",
    description: "Check if the API server is running and healthy",
    responses: {
      200: {
        description: "Server is healthy",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["ok"],
                  description: "Health status",
                },
                timestamp: {
                  type: "string",
                  format: "date-time",
                  description: "Current server timestamp",
                },
                version: {
                  type: "string",
                  description: "API version",
                },
              },
              required: ["status", "timestamp", "version"],
            },
          },
        },
      },
    },
  },
  (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    });
  },
);

// Feedback endpoints with OpenAPI documentation
openAPIApp.openapi(submitFeedbackRoute, async (c) => {
  try {
    const data = c.req.valid("json");

    // Verify tenant exists (basic validation for Phase 2)
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, data.tenantId),
    });

    if (!tenant) {
      return c.json(
        {
          error: "Invalid tenant ID",
          message: "The specified tenant does not exist or is inactive",
        },
        400,
      );
    }

    // Insert feedback
    const result = await db
      .insert(feedback)
      .values({
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
});

openAPIApp.openapi(getFeedbackRoute, async (c) => {
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
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch feedback",
      },
      500,
    );
  }
});

openAPIApp.openapi(getFeedbackByIdRoute, async (c) => {
  try {
    const { id: feedbackId } = c.req.valid("param");

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

openAPIApp.openapi(updateFeedbackStatusRoute, async (c) => {
  try {
    const { id: feedbackId } = c.req.valid("param");
    const { status } = c.req.valid("json");

    const result = await db
      .update(feedback)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, feedbackId))
      .returning();

    if (result.length === 0) {
      return c.json(
        {
          error: "Feedback not found",
          message: "The specified feedback does not exist",
        },
        404,
      );
    }

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
});

// Simple test endpoint to validate OpenAPI setup
openAPIApp.openapi(
  {
    method: "get",
    path: "/test",
    tags: ["System"],
    summary: "Test endpoint",
    description: "Simple test endpoint to validate OpenAPI configuration",
    responses: {
      200: {
        description: "Test successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Test message",
                },
                timestamp: {
                  type: "string",
                  format: "date-time",
                  description: "Current timestamp",
                },
                openapi: {
                  type: "string",
                  description: "OpenAPI version",
                },
              },
              required: ["message", "timestamp", "openapi"],
            },
          },
        },
      },
    },
  },
  (c) => {
    return c.json({
      message: "OpenAPI is working correctly!",
      timestamp: new Date().toISOString(),
      openapi: "3.0.0",
    });
  },
);

// Tenant endpoints with OpenAPI documentation
openAPIApp.openapi(createTenantRoute, async (c) => {
  try {
    const data = c.req.valid("json");

    // Check if tenant already exists
    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, parseInt(data.id)),
    });

    if (existingTenant) {
      return c.json(
        {
          error: "Tenant already exists",
          message: `Tenant with ID '${data.id}' already exists`,
        },
        409,
      );
    }

    // Create new tenant
    const result = await db
      .insert(tenants)
      .values({
        name: data.name,
        slug: data.id.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        email: data.email,
        config: data.config || {},
      })
      .returning();

    return c.json(
      {
        success: true,
        message: "Tenant created successfully",
        tenant: result[0],
      },
      201,
    );
  } catch (error) {
    console.error("Error creating tenant:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to create tenant",
      },
      500,
    );
  }
});

openAPIApp.openapi(getTenantsRoute, async (c) => {
  try {
    const tenantsList = await db.query.tenants.findMany({
      orderBy: (tenants, { desc }) => [desc(tenants.createdAt)],
    });

    return c.json({
      success: true,
      data: tenantsList,
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch tenants",
      },
      500,
    );
  }
});

openAPIApp.openapi(getTenantByIdRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, parseInt(id)),
    });

    if (!tenant) {
      return c.json(
        {
          error: "Tenant not found",
          message: "The specified tenant does not exist",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch tenant",
      },
      500,
    );
  }
});

openAPIApp.openapi(updateTenantRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    // Check if tenant exists
    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, parseInt(id)),
    });

    if (!existingTenant) {
      return c.json(
        {
          error: "Tenant not found",
          message: "The specified tenant does not exist",
        },
        404,
      );
    }

    // Update tenant
    const result = await db
      .update(tenants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, parseInt(id)))
      .returning();

    return c.json({
      success: true,
      message: "Tenant updated successfully",
      tenant: result[0],
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to update tenant",
      },
      500,
    );
  }
});

openAPIApp.openapi(deleteTenantRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");

    // Check if tenant exists
    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, parseInt(id)),
    });

    if (!existingTenant) {
      return c.json(
        {
          error: "Tenant not found",
          message: "The specified tenant does not exist",
        },
        404,
      );
    }

    // Soft delete by setting isActive to false
    const result = await db
      .update(tenants)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, parseInt(id)))
      .returning();

    return c.json({
      success: true,
      message: "Tenant deactivated successfully",
      tenant: result[0],
    });
  } catch (error) {
    console.error("Error deactivating tenant:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to deactivate tenant",
      },
      500,
    );
  }
});

openAPIApp.openapi(activateTenantRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");

    // Check if tenant exists
    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, parseInt(id)),
    });

    if (!existingTenant) {
      return c.json(
        {
          error: "Tenant not found",
          message: "The specified tenant does not exist",
        },
        404,
      );
    }

    // Reactivate tenant
    const result = await db
      .update(tenants)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, parseInt(id)))
      .returning();

    return c.json({
      success: true,
      message: "Tenant activated successfully",
      tenant: result[0],
    });
  } catch (error) {
    console.error("Error activating tenant:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to activate tenant",
      },
      500,
    );
  }
});

// Board endpoints with OpenAPI documentation
openAPIApp.openapi(createBoardRoute, async (c) => {
  try {
    const boardData = c.req.valid("json");
    const newBoard = await BoardFunctions.createBoard(boardData);

    return c.json(
      {
        success: true,
        message: "Board created successfully",
        board: newBoard,
      },
      201,
    );
  } catch (error) {
    console.error("Error creating board:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to create board",
      },
      500,
    );
  }
});

openAPIApp.openapi(getBoardsRoute, async (c) => {
  try {
    const filters = c.req.valid("query");
    const boards = await BoardFunctions.getBoardsByTenant(filters);

    return c.json({
      success: true,
      data: boards,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: boards.length,
      },
    });
  } catch (error) {
    console.error("Error fetching boards:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to fetch boards",
      },
      500,
    );
  }
});

openAPIApp.openapi(getBoardByIdRoute, async (c) => {
  try {
    const { id: boardId } = c.req.valid("param");
    const { tenantId } = c.req.valid("query");

    const board = await BoardFunctions.getBoardById(boardId, tenantId);

    if (!board) {
      return c.json(
        {
          error: "Board not found",
          message: "The specified board does not exist",
        },
        404,
      );
    }

    // Increment view count
    await BoardFunctions.incrementViewCount(boardId);

    return c.json({
      success: true,
      data: board,
    });
  } catch (error) {
    console.error("Error fetching board:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to fetch board",
      },
      500,
    );
  }
});

openAPIApp.openapi(getBoardBySlugRoute, async (c) => {
  try {
    const { slug } = c.req.valid("param");
    const { tenantId } = c.req.valid("query");

    const board = await BoardFunctions.getBoardBySlug(slug, tenantId);

    if (!board) {
      return c.json(
        {
          error: "Board not found",
          message: "The specified board does not exist",
        },
        404,
      );
    }

    // Increment view count
    await BoardFunctions.incrementViewCount(board.id);

    return c.json({
      success: true,
      data: board,
    });
  } catch (error) {
    console.error("Error fetching board by slug:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to fetch board",
      },
      500,
    );
  }
});

openAPIApp.openapi(updateBoardRoute, async (c) => {
  try {
    const { id: boardId } = c.req.valid("param");
    const { tenantId } = c.req.valid("query");
    const updateData = c.req.valid("json");

    const updatedBoard = await BoardFunctions.updateBoard(
      boardId,
      tenantId,
      updateData,
    );

    return c.json({
      success: true,
      message: "Board updated successfully",
      board: updatedBoard,
    });
  } catch (error) {
    console.error("Error updating board:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to update board",
      },
      500,
    );
  }
});

openAPIApp.openapi(deleteBoardRoute, async (c) => {
  try {
    const { id: boardId } = c.req.valid("param");
    const { tenantId } = c.req.valid("query");

    const deletedBoard = await BoardFunctions.softDeleteBoard(
      boardId,
      tenantId,
    );

    return c.json({
      success: true,
      message: "Board deleted successfully",
      board: deletedBoard,
    });
  } catch (error) {
    console.error("Error deleting board:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to delete board",
      },
      500,
    );
  }
});

openAPIApp.openapi(restoreBoardRoute, async (c) => {
  try {
    const { id: boardId } = c.req.valid("param");
    const { tenantId } = c.req.valid("query");

    const restoredBoard = await BoardFunctions.restoreBoard(boardId, tenantId);

    return c.json({
      success: true,
      message: "Board restored successfully",
      board: restoredBoard,
    });
  } catch (error) {
    console.error("Error restoring board:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to restore board",
      },
      500,
    );
  }
});

openAPIApp.openapi(getPublicBoardsRoute, async (c) => {
  try {
    const { tenantId } = c.req.valid("param");
    const { limit } = c.req.valid("query");

    const publicBoards = await BoardFunctions.getPublicBoards(tenantId, limit);

    return c.json({
      success: true,
      data: publicBoards,
    });
  } catch (error) {
    console.error("Error fetching public boards:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch public boards",
      },
      500,
    );
  }
});

openAPIApp.openapi(getBoardStatsRoute, async (c) => {
  try {
    const { id: boardId } = c.req.valid("param");
    const { tenantId } = c.req.valid("query");

    const stats = await BoardFunctions.getBoardStats(boardId, tenantId);

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching board stats:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch board stats",
      },
      500,
    );
  }
});

openAPIApp.openapi(searchBoardsRoute, async (c) => {
  try {
    const { tenantId } = c.req.valid("param");
    const { q: query, includePrivate, limit } = c.req.valid("query");

    const boards = await BoardFunctions.searchBoards(
      query,
      tenantId,
      includePrivate,
      limit,
    );

    return c.json({
      success: true,
      data: boards,
      query,
    });
  } catch (error) {
    console.error("Error searching boards:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to search boards",
      },
      500,
    );
  }
});

// User endpoints with OpenAPI documentation
openAPIApp.openapi(createUserRoute, async (c) => {
  try {
    const userData = c.req.valid("json");
    const newUser = await UserFunctions.createUser(userData);

    return c.json(
      {
        success: true,
        message: "User created successfully",
        user: newUser,
      },
      201,
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to create user",
      },
      500,
    );
  }
});

openAPIApp.openapi(getUsersRoute, async (c) => {
  try {
    const filters = c.req.valid("query");
    const users = await UserFunctions.getUsers(filters);

    return c.json({
      success: true,
      data: users,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: users.length,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to fetch users",
      },
      500,
    );
  }
});

// Post endpoints with OpenAPI documentation
openAPIApp.openapi(createPostRoute, async (c) => {
  try {
    const postData = c.req.valid("json");
    const newPost = await PostFunctions.createPost(postData);

    return c.json(
      {
        success: true,
        message: "Post created successfully",
        post: newPost,
      },
      201,
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to create post",
      },
      500,
    );
  }
});

openAPIApp.openapi(getPostsRoute, async (c) => {
  try {
    const filters = c.req.valid("query");
    const posts = await PostFunctions.getPostsByTenant(filters);

    return c.json({
      success: true,
      data: posts,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: posts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to fetch posts",
      },
      500,
    );
  }
});

// Comment endpoints with OpenAPI documentation
openAPIApp.openapi(createCommentRoute, async (c) => {
  try {
    const commentData = c.req.valid("json");
    const newComment = await CommentFunctions.createComment(commentData);

    return c.json(
      {
        success: true,
        message: "Comment created successfully",
        comment: newComment,
      },
      201,
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to create comment",
      },
      500,
    );
  }
});

openAPIApp.openapi(getCommentsRoute, async (c) => {
  try {
    const filters = c.req.valid("query");
    const comments = await CommentFunctions.getComments(filters);

    return c.json({
      success: true,
      data: comments,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: comments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to fetch comments",
      },
      500,
    );
  }
});

// Vote endpoints with OpenAPI documentation
openAPIApp.openapi(createVoteRoute, async (c) => {
  try {
    const voteData = c.req.valid("json");
    const newVote = await VoteFunctions.createVote(voteData);

    return c.json(
      {
        success: true,
        message: "Vote created successfully",
        vote: newVote,
      },
      201,
    );
  } catch (error) {
    console.error("Error creating vote:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Failed to create vote",
      },
      500,
    );
  }
});

openAPIApp.openapi(getVoteCountsRoute, async (c) => {
  try {
    const { entityType, entityId } = c.req.valid("param");
    const { tenantId } = c.req.valid("query");
    const voteCounts = await VoteFunctions.getVoteCounts(
      entityType,
      entityId,
      tenantId,
    );

    return c.json({
      success: true,
      data: voteCounts,
    });
  } catch (error) {
    console.error("Error fetching vote counts:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch vote counts",
      },
      500,
    );
  }
});

// Custom Fields endpoints with OpenAPI documentation
openAPIApp.openapi(createCustomFieldRoute, async (c) => {
  try {
    const fieldData = c.req.valid("json");
    const newField = await CustomFieldFunctions.createCustomField(fieldData);

    return c.json(
      {
        success: true,
        message: "Custom field created successfully",
        customField: newField,
      },
      201,
    );
  } catch (error) {
    console.error("Error creating custom field:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create custom field",
      },
      500,
    );
  }
});

openAPIApp.openapi(getCustomFieldsRoute, async (c) => {
  try {
    const filters = c.req.valid("query");
    const fields = await CustomFieldFunctions.getCustomFields(filters);

    return c.json({
      success: true,
      data: fields,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: fields.length,
      },
    });
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch custom fields",
      },
      500,
    );
  }
});

// Integration endpoints with OpenAPI documentation
openAPIApp.openapi(createIntegrationRoute, async (c) => {
  try {
    const integrationData = c.req.valid("json");
    const newIntegration =
      await IntegrationFunctions.createIntegration(integrationData);

    return c.json(
      {
        success: true,
        message: "Integration created successfully",
        integration: newIntegration,
      },
      201,
    );
  } catch (error) {
    console.error("Error creating integration:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create integration",
      },
      500,
    );
  }
});

openAPIApp.openapi(getIntegrationsRoute, async (c) => {
  try {
    const filters = c.req.valid("query");
    const integrations = await IntegrationFunctions.getIntegrations(filters);

    return c.json({
      success: true,
      data: integrations,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: integrations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return c.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch integrations",
      },
      500,
    );
  }
});

export default openAPIApp;
