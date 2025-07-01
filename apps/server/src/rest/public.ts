import { Hono } from "hono";
import { db } from "@/db";
import { organization } from "@/db/schema/organization";
import { boards } from "@/db/schema/boards";
import { feedback } from "@/db/schema/feedback";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";

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

export default publicApiRouter;
