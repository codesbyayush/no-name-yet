import { verify } from '@octokit/webhooks-methods';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { lower } from '@/db/utils';
import { getDb } from '../db';
import {
  boards,
  feedback,
  githubInstallations,
  githubWebhookDeliveries,
  organization,
} from '../db/schema';
import { getEnvFromContext } from '../lib/env';

const router = new Hono();

router.post('/github', async (c) => {
  try {
    const env = getEnvFromContext(c);
    const db = getDb(env);
    const deliveryId = c.req.header('x-github-delivery');
    const event = c.req.header('x-github-event');
    const signature256 = c.req.header('x-hub-signature-256') || '';

    if (!(deliveryId && event)) {
      return c.text('Missing headers', 400);
    }

    // Check if required env vars exist
    if (!env.GITHUB_WEBHOOK_SECRET) {
      return c.text('Configuration error', 500);
    }

    const body = await c.req.text();

    const isValid = await verify(
      env.GITHUB_WEBHOOK_SECRET,
      body,
      signature256
    ).catch((_error) => {
      return false;
    });

    if (!isValid) {
      return c.text('Invalid signature', 401);
    }

    // Idempotency
    try {
      await db
        .insert(githubWebhookDeliveries)
        .values({ id: deliveryId, deliveryId, event });
    } catch (_dbError) {
      return c.text('Duplicate', 202);
    }

    const payload = JSON.parse(body);

    // Process synchronously to support both local dev and Workers
    await handleEvent({ db, env, event, payload, deliveryId });
    return c.text('OK');
  } catch (_error) {
    return c.text('Internal server error', 500);
  }
});

async function handleEvent({ db, env, event, payload, deliveryId }: any) {
  try {
    switch (event) {
      case 'installation': {
        const action = payload.action;
        const inst = payload.installation;

        if (!inst) {
          break;
        }

        if (action === 'created') {
          await upsertInstallation(db, inst, env);
        } else if (action === 'deleted') {
          await db
            .delete(githubInstallations)
            .where(eq(githubInstallations.githubInstallationId, inst.id));
        }
        break;
      }
      case 'pull_request': {
        await handlePullRequest(db, payload);
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
    } catch (_updateError) {}
  }
}

async function upsertInstallation(db: any, inst: any, _env: any) {
  const account = inst.account; // org or user
  const id = String(inst.id);

  const row = {
    id,
    githubInstallationId: inst.id,
    accountLogin: account.login,
    accountId: account.id,
    appId: inst.app_id,
  };

  // Try to map to tenant by org slug = account.login
  const org = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, account.login))
    .limit(1);

  if (org[0]?.id) {
    (row as any).organizationId = org[0].id;
  }

  try {
    await db.insert(githubInstallations).values(row);
  } catch (_insertError) {
    await db
      .update(githubInstallations)
      .set(row)
      .where(eq(githubInstallations.githubInstallationId, inst.id));
  }
}

async function handlePullRequest(db: any, payload: any) {
  try {
    const action: string = payload.action;
    const pr = payload.pull_request;
    const repo = payload.repository;
    if (!(pr && repo)) {
      return;
    }

    const branch: string = pr.head?.ref || ''; // e.g., ayush/pe-102/title or pe-102/title
    const m = branch
      .toLowerCase()
      .match(/^(?:[a-z0-9][a-z0-9-]*\/)?([a-z0-9]+-\d+)(?:\/.*)?$/);
    if (!m) {
      return;
    }
    const issueKey = m[1];

    // Find organization via installation id
    const installationId: number | undefined = payload.installation?.id;
    if (!installationId) {
      return;
    }
    const instRows = await db
      .select({ orgId: githubInstallations.organizationId })
      .from(githubInstallations)
      .where(eq(githubInstallations.githubInstallationId, installationId))
      .limit(1);
    const orgId = instRows[0]?.orgId;
    if (!orgId) {
      return;
    }

    // Resolve feedback by issueKey within org (join via boards)
    const fbRows = await db
      .select({ id: feedback.id })
      .from(feedback)
      .leftJoin(boards, eq(boards.id, feedback.boardId))
      .where(
        and(
          eq(lower(feedback.issueKey), issueKey.toLowerCase()),
          eq(boards.organizationId, orgId)
        )
      )
      .limit(1);
    const fbId = fbRows[0]?.id;
    if (!fbId) {
      return;
    }

    // Status mapping
    let nextStatusKey: string | null = null;
    if (action === 'opened' || action === 'reopened') {
      nextStatusKey = 'in-progress';
    } else if (action === 'ready_for_review') {
      nextStatusKey = 'technical-review';
    } else if (action === 'closed' && pr.merged) {
      const defaultBranch = repo.default_branch || 'main';
      if (pr.base?.ref?.toLowerCase() === defaultBranch.toLowerCase()) {
        nextStatusKey = 'completed';
      }
    }
    if (!nextStatusKey) {
      return;
    }

    await db
      .update(feedback)
      .set({ status: nextStatusKey })
      .where(eq(feedback.id, fbId));
  } catch (_err) {}
}

export default router;
