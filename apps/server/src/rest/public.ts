import { and, count, eq, inArray, isNull, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod/v4';
import { getDb } from '@/db';
import { boards } from '@/db/schema/boards';
import { feedback } from '@/db/schema/feedback';
import { organization } from '@/db/schema/organization';
import { getEnvFromContext } from '../lib/env';

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

publicApiRouter.use('*', async (c, next) => {
  const publicKey = c.req.header('X-Public-Key');

  if (!publicKey) {
    return c.json(
      { error: 'Unauthorized', message: 'API key is missing.' },
      401
    );
  }

  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.publicKey, publicKey));

    if (!org || org.length === 0) {
      return c.json(
        { error: 'Unauthorized', message: 'Invalid API key.' },
        401
      );
    }

    // --- Domain Whitelisting (CORS) ---
    // const origin = c.req.header("Origin");
    // if (process.env.NODE_ENV === "production" && !org.allowedDomains.includes(origin)) {
    //   return c.json({ error: "Forbidden", message: "This domain is not authorized to access the API." }, 403);
    // }

    c.set('organization', org[0]);
  } catch (_error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  await next();
});

/**
 * GET /public/boards
 *
 * @returns {Array<Object>} A list of board objects with limited public fields.
 */
publicApiRouter.get('/boards', async (c) => {
  const org = c.get('organization');

  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
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
          isNull(boards.deletedAt)
        )
      );

    return c.json(publicBoards);
  } catch (_error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /public/tags
 * @returns {Array<string>} A flat list of unique tag strings.
 */
publicApiRouter.get('/tags', async (c) => {
  const org = c.get('organization');

  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
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
        FROM feedback
        WHERE board_id IN ${inArray(feedback.boardId, boardIdList)}
          AND tags IS NOT NULL AND cardinality(tags) > 0
        ORDER BY tag;
    `);

    const tags = (tagsResult.rows as { tag: string }[]).map((row) => row.tag);

    return c.json(tags);
  } catch (_error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

const feedbackSubmissionSchema = z.object({
  boardId: z.string(),
  description: z.string().min(1, 'Description cannot be empty.'),
  authorId: z.string(),
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
publicApiRouter.post('/feedback', async (c) => {
  const org = c.get('organization');
  const body = await c.req.json();

  const validation = feedbackSubmissionSchema.safeParse(body);
  if (!validation.success) {
    return c.json(
      { error: 'Invalid input', details: validation.error.flatten() },
      400
    );
  }

  const { boardId, description, authorId } = validation.data;

  // Security Check: Verify the board belongs to the organization.
  // This prevents a user from one org from submitting feedback to a board of another org.
  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.organizationId, org.id)),
      columns: { id: true },
    });

    if (!board) {
      return c.json(
        { error: 'Forbidden', message: 'Board not found or access denied.' },
        403
      );
    }

    const postsCount = await db
      .select({ count: count() })
      .from(feedback)
      .where(eq(feedback.boardId, boardId));

    const issueKey = `OF-${postsCount[0]?.count || 0 + 1}`;

    const [newFeedbackItem] = await db
      .insert(feedback)
      .values({
        boardId,
        description,
        title: `Feedback: ${description.substring(0, 50)}`,
        authorId,
        issueKey,
      })
      .returning({ id: feedback.id });

    return c.json({ success: true, feedbackId: newFeedbackItem.id }, 201);
  } catch (_error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default publicApiRouter;
