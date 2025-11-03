import type { InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import type { Context as HonoContext } from 'hono';
import { getDb } from '../db';
import { organization, user } from '../db/schema';
import { getAuth } from '../lib/auth';
import { type Cache, getCache } from '../lib/cache';
import type { AppEnv } from '../lib/env';
import { resolveOrganizationFromHeaders } from '../services/organization';

export type CreateContextOptions = {
  context: HonoContext;
  env: AppEnv;
};

export async function createContext({ context, env }: CreateContextOptions) {
  const db = getDb(env);
  const auth = getAuth(env);
  const cache = getCache(env);
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  const { organization: org, subdomain } = await resolveOrganizationFromHeaders(
    db,
    context.req.raw.headers,
  );

  return {
    session,
    organization: org,
    subdomain: subdomain || undefined,
    db,
    cache,
    env,
  };
}

export async function createAdminContext({
  context,
  env,
}: CreateContextOptions) {
  const db = getDb(env);
  const auth = getAuth(env);
  const cache = getCache(env);
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  if (!session?.user?.id) {
    return {
      session: null,
      user: null,
      organization: null,
      db,
      cache,
      env,
    };
  }

  try {
    // Get user with organizationId
    const userResult = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    const currentUser = userResult[0] || null;

    if (!currentUser?.organizationId) {
      return {
        session,
        user: currentUser,
        organization: null,
        db,
        cache,
        env,
      };
    }

    // Get organization from user's organizationId
    const orgResult = await db
      .select()
      .from(organization)
      .where(eq(organization.id, currentUser.organizationId))
      .limit(1);

    const org = orgResult[0] || null;
    return {
      session,
      user: currentUser,
      organization: org,
      db,
      cache,
      env,
    };
  } catch (_error) {
    return {
      session,
      user: null,
      organization: null,
      db,
      cache,
      env,
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> & {
  organization: InferSelectModel<typeof organization> | null;
  subdomain?: string;
  db: ReturnType<typeof getDb>;
  cache: Cache;
  env: AppEnv;
};

export type AdminContext = Awaited<ReturnType<typeof createAdminContext>> & {
  user: InferSelectModel<typeof user> | null;
  organization: InferSelectModel<typeof organization> | null;
  db: ReturnType<typeof getDb>;
  cache: Cache;
  env: AppEnv;
};
