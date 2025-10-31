import { verify } from '@octokit/webhooks-methods';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { getDb } from '../db';
import { githubWebhookDeliveries } from '../db/schema';
import { getEnvFromContext } from '../lib/env';
import {
  deleteInstallation,
  type GitHubInstallation,
  handlePullRequest,
  type PullRequestPayload,
  upsertInstallation,
} from '../services/github';

const router = new Hono();

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  ACCEPTED: 202,
  INTERNAL_SERVER_ERROR: 500,
} as const;

router.post('/github', async (c) => {
  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
    const deliveryId = c.req.header('x-github-delivery');
    const event = c.req.header('x-github-event');
    const signature256 = c.req.header('x-hub-signature-256') || '';

    if (!(deliveryId && event)) {
      return c.text('Missing headers', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if required env vars exist
    if (!env.GH_WEBHOOK_SECRET) {
      return c.text('Configuration error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const body = await c.req.text();

    const isValid = await verify(
      env.GH_WEBHOOK_SECRET,
      body,
      signature256,
    ).catch(() => false);

    if (!isValid) {
      return c.text('Invalid signature', HTTP_STATUS.UNAUTHORIZED);
    }

    // Idempotency
    try {
      await db
        .insert(githubWebhookDeliveries)
        .values({ id: deliveryId, deliveryId, event });
    } catch (_dbError) {
      return c.text('Duplicate', HTTP_STATUS.ACCEPTED);
    }

    const payload = JSON.parse(body);

    // Process synchronously to support both local dev and Workers
    await handleEvent({ db, event, payload, deliveryId });
    return c.text('OK');
  } catch (_error) {
    return c.text('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Zod schemas for payload validation
const InstallationSchema = z.object({
  action: z.string(),
  installation: z.object({
    id: z.number(),
    app_id: z.number(),
    account: z.object({ login: z.string(), id: z.number() }),
  }),
});

const PullRequestSchema = z.object({
  action: z.enum(['opened', 'reopened', 'ready_for_review', 'closed']),
  pull_request: z.object({
    head: z.object({ ref: z.string() }),
    base: z.object({ ref: z.string() }),
    merged: z.boolean(),
  }),
  repository: z.object({ default_branch: z.string() }),
  installation: z.object({ id: z.number() }).optional(),
});

async function handleEvent({
  db,
  event,
  payload,
  deliveryId,
}: {
  db: ReturnType<typeof getDb>;
  event: string;
  payload: Record<string, unknown>;
  deliveryId: string;
}) {
  try {
    switch (event) {
      case 'installation': {
        const validated = InstallationSchema.safeParse(payload);
        if (!validated.success) {
          break;
        }
        const action = validated.data.action;
        const inst = validated.data.installation as GitHubInstallation;

        if (!inst) {
          break;
        }

        if (action === 'created') {
          await upsertInstallation(db, inst);
        } else if (action === 'deleted') {
          await deleteInstallation(db, inst.id);
        }
        break;
      }
      case 'pull_request': {
        const validated = PullRequestSchema.safeParse(payload);
        if (!validated.success) {
          break;
        }
        await handlePullRequest(db, validated.data as PullRequestPayload);
        break;
      }
      default:
        break;
    }
  } finally {
    // mark handled
    try {
      await db
        .update(githubWebhookDeliveries)
        .set({ handledAt: new Date() })
        .where(eq(githubWebhookDeliveries.deliveryId, deliveryId));
    } catch (_updateError) {
      // Ignore update errors - webhook already processed
    }
  }
}

export default router;
