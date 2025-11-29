import { and, eq, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod/v4';
import { getDb } from '@/db';
import { tags } from '@/db/schema';
import { boards } from '@/db/schema/boards';
import { feedback } from '@/db/schema/feedback';
import { team } from '@/db/schema/organization';
import { getEnvFromContext } from '../lib/env';
import { logger } from '../lib/logger';

type AppContext = {
  Variables: {
    team: {
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
      401,
    );
  }

  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
    const teamResult = await db
      .select()
      .from(team)
      .where(eq(team.publicKey, publicKey));

    if (!teamResult || teamResult.length === 0) {
      return c.json(
        { error: 'Unauthorized', message: 'Invalid API key.' },
        401,
      );
    }

    // --- Domain Whitelisting (CORS) ---
    // const origin = c.req.header("Origin");
    // if (process.env.NODE_ENV === "production" && !org.allowedDomains.includes(origin)) {
    //   return c.json({ error: "Forbidden", message: "This domain is not authorized to access the API." }, 403);
    // }

    c.set('team', teamResult[0]);
  } catch (error) {
    logger.error('Failed to authenticate public API request', {
      scope: 'rest-public',
      context: { publicKey: publicKey ? 'present' : 'missing', error },
    });
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
  const teamContext = c.get('team');

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
          eq(boards.teamId, teamContext.id),
          eq(boards.isPrivate, false),
          isNull(boards.deletedAt),
        ),
      );

    return c.json(publicBoards);
  } catch (error) {
    logger.error('Failed to fetch public boards', {
      scope: 'rest-public',
      context: { teamId: teamContext.id, error },
    });
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /public/tags
 * @returns {Array<string>} A flat list of unique tag strings.
 */
publicApiRouter.get('/tags', async (c) => {
  const teamContext = c.get('team');

  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
    const teamTags = await db
      .select()
      .from(tags)
      .where(eq(tags.teamId, teamContext.id));

    return c.json(teamTags);
  } catch (error) {
    logger.error('Failed to fetch public tags', {
      scope: 'rest-public',
      context: { teamId: teamContext.id, error },
    });
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

const feedbackSubmissionSchema = z.object({
  boardId: z.string(),
  title: z.string().min(1, "Title can't be empty."),
  description: z.string().min(1, 'Description cannot be empty.'),
  metadata: z.record(z.string(), z.any()).optional(),
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
  const teamContext = c.get('team');
  const body = await c.req.json();

  const validation = feedbackSubmissionSchema.safeParse(body);
  if (!validation.success) {
    return c.json(
      { error: 'Invalid input', details: z.treeifyError(validation.error) },
      400,
    );
  }

  const { boardId, description, metadata, title } = validation.data;

  // Security Check: Verify the board belongs to the organization.
  // This prevents a user from one org from submitting feedback to a board of another org.
  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
    const board = await db
      .select({ id: boards.id })
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.teamId, teamContext.id)));

    if (board.length === 0) {
      return c.json({ error: 'NOT_FOUND', message: 'Board not found.' }, 404);
    }

    const [newFeedbackItem] = await db
      .insert(feedback)
      .values({
        boardId,
        description,
        title,
        metadata,
        status: 'pending',
      })
      .returning({ id: feedback.id });

    return c.json({ success: true, feedbackId: newFeedbackItem.id }, 201);
  } catch (error) {
    logger.error('Failed to create public feedback', {
      scope: 'rest-public',
      context: { teamId: teamContext.id, boardId, error },
    });
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default publicApiRouter;
