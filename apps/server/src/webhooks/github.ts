import { verify } from '@octokit/webhooks-methods';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { lower } from '@/db/utils';
import { getDb } from '../db';
import {
  boards,
  feedback,
  githubInstallations,
  githubRepositories,
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

    console.log('GitHub Webhook received:', { deliveryId, event });

    if (!(deliveryId && event)) {
      console.error('Missing required headers:', { deliveryId, event });
      return c.text('Missing headers', 400);
    }

    // Check if required env vars exist
    if (!env.GITHUB_WEBHOOK_SECRET) {
      console.error('GITHUB_WEBHOOK_SECRET not found in environment');
      return c.text('Configuration error', 500);
    }

    const body = await c.req.text();
    console.log('Received body length:', body.length);

    const isValid = await verify(
      env.GITHUB_WEBHOOK_SECRET,
      body,
      signature256
    ).catch((error) => {
      console.error('Signature verification failed:', error);
      return false;
    });

    if (!isValid) {
      console.error('Invalid signature for delivery:', deliveryId);
      return c.text('Invalid signature', 401);
    }

    console.log('Signature verified successfully');

    // Idempotency
    try {
      await db
        .insert(githubWebhookDeliveries)
        .values({ id: deliveryId, deliveryId, event });
      console.log('Webhook delivery recorded:', deliveryId);
    } catch (dbError) {
      console.log('Duplicate webhook delivery:', deliveryId, dbError);
      return c.text('Duplicate', 202);
    }

    const payload = JSON.parse(body);
    console.log('Parsed payload for event:', event, 'action:', payload.action);

    // Process synchronously to support both local dev and Workers
    await handleEvent({ db, env, event, payload, deliveryId });
    return c.text('OK');
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return c.text('Internal server error', 500);
  }
});

async function handleEvent({ db, env, event, payload, deliveryId }: any) {
  try {
    console.log('Processing event:', event, 'for delivery:', deliveryId);

    switch (event) {
      case 'installation': {
        const action = payload.action;
        const inst = payload.installation;
        console.log('Installation event:', action, inst?.id);

        if (!inst) {
          console.error('No installation data in payload');
          break;
        }

        if (action === 'created') {
          console.log('Creating installation:', inst.id);
          await upsertInstallation(db, inst, env);
        } else if (action === 'deleted') {
          console.log('Deleting installation:', inst.id);
          await db
            .delete(githubInstallations)
            .where(eq(githubInstallations.githubInstallationId, inst.id));
        }
        break;
      }
      case 'installation_repositories': {
        const inst = payload.installation;
        console.log('Repository sync event for installation:', inst?.id);

        if (!inst) {
          console.error('No installation data in repositories payload');
          break;
        }

        console.log('Syncing repositories for installation:', inst.id);
        await syncRepositories(
          db,
          inst.id,
          payload.repositories_added,
          payload.repositories_removed
        );
        break;
      }
      case 'pull_request': {
        await handlePullRequest(db, payload);
        break;
      }
      default:
        console.log('Unhandled event type:', event);
        break;
    }
  } catch (error) {
    console.error(
      'Error processing event:',
      event,
      'delivery:',
      deliveryId,
      error
    );
    throw error; // Re-throw to see it in logs
  } finally {
    // mark handled
    try {
      await db
        .update(githubWebhookDeliveries)
        .set({ handledAt: new Date() })
        .where(eq(githubWebhookDeliveries.deliveryId, deliveryId));
      console.log('Marked delivery as handled:', deliveryId);
    } catch (updateError) {
      console.error(
        'Error marking delivery as handled:',
        deliveryId,
        updateError
      );
    }
  }
}

async function upsertInstallation(db: any, inst: any, env: any) {
  try {
    const account = inst.account; // org or user
    const id = String(inst.id);
    console.log('Upserting installation:', {
      id,
      accountLogin: account?.login,
      appId: inst.app_id,
    });

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

    console.log(
      'Organization lookup result:',
      org[0]?.id ? `Found: ${org[0].id}` : 'Not found'
    );

    if (org[0]?.id) {
      (row as any).organizationId = org[0].id;
    }

    try {
      await db.insert(githubInstallations).values(row);
      console.log('Successfully inserted installation:', id);
    } catch (insertError) {
      console.log('Insert failed, trying update:', insertError);
      await db
        .update(githubInstallations)
        .set(row)
        .where(eq(githubInstallations.githubInstallationId, inst.id));
      console.log('Successfully updated installation:', id);
    }
  } catch (error) {
    console.error('Error in upsertInstallation:', error);
    throw error;
  }
}

async function syncRepositories(
  db: any,
  installationId: number,
  added: any[] = [],
  removed: any[] = []
) {
  try {
    console.log('Syncing repositories:', {
      installationId,
      addedCount: added?.length || 0,
      removedCount: removed?.length || 0,
    });

    const installRow = await db
      .select({ id: githubInstallations.id })
      .from(githubInstallations)
      .where(eq(githubInstallations.githubInstallationId, installationId))
      .limit(1);

    if (!installRow[0]) {
      console.error(
        'Installation not found for repository sync:',
        installationId
      );
      return;
    }

    const installationPk = installRow[0].id;
    console.log('Found installation record:', installationPk);

    // Add repositories
    for (const repo of added || []) {
      const row = {
        id: `${installationPk}:${repo.id}`,
        installationId: installationPk,
        repoId: repo.id,
        fullName: repo.full_name,
        name: repo.name,
        private: !!repo.private,
        defaultBranch: repo.default_branch || null,
      };

      try {
        await db.insert(githubRepositories).values(row);
        console.log('Added repository:', repo.full_name);
      } catch (insertError) {
        console.log(
          'Repository insert failed, trying update:',
          repo.full_name,
          insertError
        );
        await db
          .update(githubRepositories)
          .set(row)
          .where(
            and(
              eq(githubRepositories.installationId, installationPk),
              eq(githubRepositories.repoId, repo.id)
            )
          );
        console.log('Updated repository:', repo.full_name);
      }
    }

    // Remove repositories
    for (const repo of removed || []) {
      try {
        await db
          .delete(githubRepositories)
          .where(
            and(
              eq(githubRepositories.installationId, installationPk),
              eq(githubRepositories.repoId, repo.id)
            )
          );
        console.log('Removed repository:', repo.full_name);
      } catch (deleteError) {
        console.error(
          'Error removing repository:',
          repo.full_name,
          deleteError
        );
      }
    }

    console.log('Repository sync completed for installation:', installationId);
  } catch (error) {
    console.error('Error in syncRepositories:', error);
    throw error;
  }
}

async function handlePullRequest(db: any, payload: any) {
  try {
    const action: string = payload.action;
    const pr = payload.pull_request;
    const repo = payload.repository;
    if (!(pr && repo)) return;

    const branch: string = pr.head?.ref || ''; // e.g., ayush/pe-102/title or pe-102/title
    const m = branch
      .toLowerCase()
      .match(/^(?:[a-z0-9][a-z0-9-]*\/)?([a-z0-9]+-\d+)(?:\/.*)?$/);
    if (!m) return;
    const issueKey = m[1];

    // Find organization via installation id
    const installationId: number | undefined = payload.installation?.id;
    if (!installationId) return;
    const instRows = await db
      .select({ orgId: githubInstallations.organizationId })
      .from(githubInstallations)
      .where(eq(githubInstallations.githubInstallationId, installationId))
      .limit(1);
    const orgId = instRows[0]?.orgId;
    if (!orgId) return;

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
    if (!fbId) return;

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
    if (!nextStatusKey) return;

    await db
      .update(feedback)
      .set({ status: nextStatusKey })
      .where(eq(feedback.id, fbId));
    console.log(`Updated issue ${issueKey} to status ${nextStatusKey}`);
  } catch (err) {
    console.error('handlePullRequest error', err);
  }
}

export default router;
