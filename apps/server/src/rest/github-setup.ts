import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { getDb } from '../db';
import { githubInstallations } from '../db/schema';
import { getEnvFromContext } from '../lib/env';
import { verifyInstallState } from '../lib/state';

const HTTP_PROTOCOL_RE = /^https?:\/\//i;
const router = new Hono();

router.get('/setup', async (c) => {
  const env = getEnvFromContext(c);
  const db = getDb(env);
  const installationId = c.req.query('installation_id');
  const state = c.req.query('state');
  const setupAction = c.req.query('setup_action');

  // Normalize FRONTEND_URL to a fully-qualified URL with protocol
  let frontendBase = (env.FRONTEND_URL || '').trim();
  if (!HTTP_PROTOCOL_RE.test(frontendBase)) {
    frontendBase = `https://app.${frontendBase}`;
  }

  // Attempt to verify state and auto-link
  if (installationId && state) {
    const decoded = await verifyInstallState(env, state);
    if (decoded?.teamId) {
      try {
        await db
          .update(githubInstallations)
          .set({ teamId: decoded.teamId })
          .where(
            eq(
              githubInstallations.githubInstallationId,
              Number(installationId),
            ),
          );
      } catch {
        // no-op: best-effort linking only
      }
    }
  }

  // Redirect back to admin with installation info
  const redirectUrl = new URL('/settings/integrations', frontendBase);
  if (installationId) {
    redirectUrl.searchParams.set('installation_id', installationId);
  }
  if (setupAction) {
    redirectUrl.searchParams.set('setup_action', setupAction);
  }

  return c.redirect(redirectUrl.toString());
});

export default router;
