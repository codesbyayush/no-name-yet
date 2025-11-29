import { eq } from 'drizzle-orm';
import type { Database } from '@/db';
import { type Team, team } from '@/db/schema';
import type { Cache } from '@/lib/cache';
import {
  extractSubdomainFromHost,
  extractSubdomainFromOrigin,
} from '@/lib/subdomain';

// Re-export for backwards compatibility
export { extractSubdomainFromHost, extractSubdomainFromOrigin };

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: string | null;
  publicKey: string | null;
  createdAt: Date;
};

/**
 * Resolve organization by subdomain
 */
export async function getTeamBySubdomain(
  db: Database,
  subdomain: string,
  cache: Cache,
  ttlSeconds = 300,
): Promise<Team | null> {
  const cacheKey = `team:subdomain:${subdomain}`;

  try {
    const cachedValue = await cache.get(cacheKey);
    if (cachedValue) {
      const parsed = JSON.parse(cachedValue) as
        | (Team & { createdAt: string })
        | null;
      if (!parsed) {
        return null;
      }

      const { createdAt, ...rest } = parsed;
      return {
        ...rest,
        createdAt: new Date(createdAt),
      };
    }
  } catch {
    await cache.delete(cacheKey);
  }

  const [result] = await db
    .select()
    .from(team)
    .where(eq(team.slug, subdomain))
    .limit(1);

  if (!result) {
    await cache.set(cacheKey, JSON.stringify(null), ttlSeconds);
    return null;
  }

  const teamRecord: Team = {
    id: result.id,
    name: result.name,
    slug: result.slug,
    logo: result.logo,
    publicKey: result.publicKey,
    createdAt: result.createdAt,
    organizationId: result.organizationId,
    updatedAt: result.updatedAt,
  };

  await cache.set(
    cacheKey,
    JSON.stringify({
      ...teamRecord,
      createdAt: teamRecord.createdAt.toISOString(),
    }),
    ttlSeconds,
  );

  return teamRecord;
}

/**
 * Resolve organization from request headers
 * Tries multiple strategies:
 * 1. X-Forwarded-Host header
 * 2. Host header
 * 3. Origin header
 */
export async function resolveTeamFromHeaders(
  db: Database,
  headers: Headers,
  cache: Cache,
): Promise<{ team: Team | null; subdomain: string | null }> {
  // Try X-Forwarded-Host first (for reverse proxies)
  const xfHost = headers.get('x-forwarded-host');
  const host = xfHost ? xfHost.split(',')[0].trim() : headers.get('host') || '';

  let subdomain = extractSubdomainFromHost(host);

  // Fallback to Origin header
  if (!subdomain) {
    const origin = headers.get('origin');
    subdomain = origin ? extractSubdomainFromOrigin(origin) : null;
  }

  if (!subdomain) {
    return { team: null, subdomain: null };
  }

  const teamResult = await getTeamBySubdomain(db, subdomain, cache);
  return { team: teamResult, subdomain };
}
