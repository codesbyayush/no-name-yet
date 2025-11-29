import type { InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import type { Context as HonoContext } from 'hono';
import { getDb } from '../db';
import { type Team, team, type user } from '../db/schema';
import { getAuth } from '../lib/auth';
import { type Cache, getCache } from '../lib/cache';
import type { AppEnv } from '../lib/env';
import { type Logger, logger } from '../lib/logger';
import { resolveTeamFromHeaders } from '../services/organization';

export type CreateContextOptions = {
  context: HonoContext;
  env: AppEnv;
};

export async function createContext({ context, env }: CreateContextOptions) {
  const db = getDb(env);
  const auth = getAuth(env);
  const cache = await getCache(env);
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  const { team: resolvedTeam, subdomain } = await resolveTeamFromHeaders(
    db,
    context.req.raw.headers,
    cache,
  );

  return {
    session,
    team: resolvedTeam,
    subdomain: subdomain || undefined,
    db,
    cache,
    env,
    logger,
  };
}

export async function createAdminContext({
  context,
  env,
}: CreateContextOptions) {
  const db = getDb(env);
  const auth = getAuth(env);
  const cache = await getCache(env);
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  const headers = context.req.raw.headers;

  if (!session?.user?.id) {
    return {
      session: null,
      user: null,
      team: null,
      headers,
      db,
      cache,
      env,
      logger,
    };
  }

  try {
    // Use session's activeTeamId (managed by better-auth)
    // This is set when user accepts invitation or switches organizations
    const activeTeamId = session.session?.activeTeamId;

    if (!activeTeamId) {
      return {
        session,
        user: session.user,
        team: null,
        headers,
        db,
        cache,
        env,
        logger,
      };
    }

    // Get team from session's activeTeamId
    const teamResult: Team | undefined = await db.query.team.findFirst({
      where: eq(team.id, activeTeamId),
    });

    return {
      session,
      user: session.user,
      team: teamResult || null,
      headers,
      db,
      cache,
      env,
      logger,
    };
  } catch (error) {
    logger.error('Failed to resolve team for admin context', {
      scope: 'context',
      context: { userId: session.user.id },
      error,
      operational: true, // Fallback to no team is acceptable
    });
    return {
      session,
      user: null,
      team: null,
      headers,
      db,
      cache,
      env,
      logger,
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> & {
  team: InferSelectModel<typeof team> | null;
  subdomain?: string;
  db: ReturnType<typeof getDb>;
  cache: Cache;
  env: AppEnv;
  logger: Logger;
};

export type AdminContext = Awaited<ReturnType<typeof createAdminContext>> & {
  user: InferSelectModel<typeof user> | null;
  team: InferSelectModel<typeof team> | null;
  headers: Headers;
  db: ReturnType<typeof getDb>;
  cache: Cache;
  env: AppEnv;
  logger: Logger;
};
