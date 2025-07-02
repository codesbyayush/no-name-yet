import { Hono } from "hono";
import { db } from "@/db";
import { organization } from "@/db/schema/organization";
import { boards } from "@/db/schema/boards";
import { feedback } from "@/db/schema/feedback";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod/v4";

type AppContext = {
  Variables: {
    organization: {
      id: string;
      // attach a list of allowed domains for CORS checks.
      // allowedDomains: string[];
    };
  };
};

const publicApiRouter = new Hono<AppContext>();

publicApiRouter.use("*", async (c, next) => {
  const publicKey = c.req.header("X-Public-Key");

  if (!publicKey) {
    return c.json(
      { error: "Unauthorized", message: "API key is missing." },
      401,
    );
  }

  try {
    const org = await db.query.organization.findFirst({
      where: eq(organization.publicKey, publicKey),
      columns: {
        id: true,
      },
    });

    if (!org) {
      return c.json(
        { error: "Unauthorized", message: "Invalid API key." },
        401,
      );
    }

    // --- Domain Whitelisting (CORS) ---
    // const origin = c.req.header("Origin");
    // if (process.env.NODE_ENV === "production" && !org.allowedDomains.includes(origin)) {
    //   return c.json({ error: "Forbidden", message: "This domain is not authorized to access the API." }, 403);
    // }

    c.set("organization", org);
  } catch (error) {
    console.error("API key validation error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }

  await next();
});

/**
 * GET /public/boards
 *
 * @returns {Array<Object>} A list of board objects with limited public fields.
 */
publicApiRouter.get("/boards", async (c) => {
  const org = c.get("organization");

  try {
    const publicBoards = await db
      .select({
        id: boards.id,
        name: boards.name,
        slug: boards.slug,
        description: boards.description,
      })
      .from(boards)
      .where(
        and(
          eq(boards.organizationId, org.id),
          eq(boards.isPrivate, false),
          isNull(boards.deletedAt),
        ),
      );

    return c.json(publicBoards);
  } catch (error) {
    console.error(`Error fetching public boards for org ${org.id}:`, error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

/**
 * GET /public/tags
 * @returns {Array<string>} A flat list of unique tag strings.
 */
publicApiRouter.get("/tags", async (c) => {
  const org = c.get("organization");

  try {
    const orgBoards = await db
      .select({ id: boards.id })
      .from(boards)
      .where(and(eq(boards.organizationId, org.id), isNull(boards.deletedAt)));

    if (orgBoards.length === 0) {
      return c.json([]); // No boards, so no tags
    }
    const boardIdList = orgBoards.map((b) => b.id);

    const tagsResult = await db.execute(sql`
        SELECT DISTINCT unnest(tags) as tag
        FROM ${feedback}
        WHERE board_id IN ${inArray(feedback.boardId, boardIdList)}
          AND tags IS NOT NULL AND cardinality(tags) > 0
        ORDER BY tag;
    `);

    const tags = (tagsResult.rows as { tag: string }[]).map((row) => row.tag);

    return c.json(tags);
  } catch (error) {
    console.error(`Error fetching tags for org ${org.id}:`, error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

const feedbackSubmissionSchema = z.object({
  boardId: z.string(),
  type: z.enum(["bug", "suggestion"]),
  description: z.string().min(1, "Description cannot be empty."),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  user: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  customData: z.record(z.any(), z.any()).optional(),
  browserInfo: z.object({
    userAgent: z.string(),
    url: z.string(),
    platform: z.string().optional(),
    language: z.string().optional(),
    cookieEnabled: z.boolean().optional(),
    onLine: z.boolean().optional(),
    screenResolution: z.string().optional(),
  }),
});

/**
 * POST /public/feedback
 *
 * Submits new feedback from the public widget.
 * The request is validated against a Zod schema to ensure type safety.
 *
 * It performs a crucial security check to ensure the provided `boardId`
 * belongs to the organization associated with the `X-Public-Key`.
 *
 * @returns {Object} A success message and the ID of the created feedback.
 */
publicApiRouter.post("/feedback", async (c) => {
  const org = c.get("organization");
  const body = await c.req.json();

  const validation = feedbackSubmissionSchema.safeParse(body);
  if (!validation.success) {
    return c.json(
      { error: "Invalid input", details: validation.error.flatten() },
      400,
    );
  }

  const {
    boardId,
    type,
    description,
    severity,
    user,
    customData, // Note: customData is captured but not yet stored in the DB.
    browserInfo,
  } = validation.data;

  // Security Check: Verify the board belongs to the organization.
  // This prevents a user from one org from submitting feedback to a board of another org.
  try {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.organizationId, org.id)),
      columns: { id: true },
    });

    if (!board) {
      return c.json(
        { error: "Forbidden", message: "Board not found or access denied." },
        403,
      );
    }

    const { userAgent, url, ...restOfBrowserInfo } = browserInfo;

    const [newFeedbackItem] = await db
      .insert(feedback)
      .values({
        boardId,
        type,
        description,
        // Auto-generate a title from the description
        title: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${description.substring(0, 50)}`,
        // Note: The 'severity' field is not present in the current database schema.
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        userAgent: userAgent,
        url: url,
        browserInfo: restOfBrowserInfo,
        // The 'feedback' schema would need a 'customData' jsonb column to store this.
        // customData: customData,
      })
      .returning({ id: feedback.id });

    return c.json({ success: true, feedbackId: newFeedbackItem.id }, 201);
  } catch (error) {
    console.error(`Error submitting feedback for org ${org.id}:`, error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default publicApiRouter;
