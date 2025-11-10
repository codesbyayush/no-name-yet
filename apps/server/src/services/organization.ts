import { eq } from 'drizzle-orm';
import type { Database } from '@/dal/posts';
import { organization } from '@/db/schema';
import type { Cache } from '@/lib/cache';

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
 * Extract subdomain from host header
 * Handles various formats:
 * - "app.example.com" -> "app"
 * - "subdomain.example.com:3000" -> "subdomain"
 * - "localhost:3000" -> null
 */
export function extractSubdomainFromHost(host: string): string | null {
  if (!host || host.startsWith('localhost')) {
    return null;
  }

  // Remove port if present
  const cleanHost = host.includes(':') ? host.split(':')[0] : host;

  const parts = cleanHost.split('.');
  if (parts.length < 2) {
    return null;
  } else if (parts.length === 2 && parts[1] !== 'localhost') {
    return null;
  }

  const candidate = parts[0];
  // Skip common prefixes
  if (candidate === 'www' || candidate === 'api') {
    return null;
  }

  return candidate;
}

/**
 * Extract subdomain from origin header
 * Handles formats like "https://subdomain.example.com"
 */
export function extractSubdomainFromOrigin(origin: string): string | null {
  if (!origin) {
    return null;
  }

  try {
    const url = new URL(origin);
    return extractSubdomainFromHost(url.host);
  } catch {
    return null;
  }
}

/**
 * Resolve organization by subdomain
 */
export async function getOrganizationBySubdomain(
  db: Database,
  subdomain: string,
  cache: Cache,
  ttlSeconds = 300,
): Promise<Organization | null> {
  const cacheKey = `organization:subdomain:${subdomain}`;

  try {
    const cachedValue = await cache.get(cacheKey);
    if (cachedValue) {
      const parsed = JSON.parse(cachedValue) as
        | (Organization & { createdAt: string })
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
    .from(organization)
    .where(eq(organization.slug, subdomain))
    .limit(1);

  if (!result) {
    await cache.set(cacheKey, JSON.stringify(null), ttlSeconds);
    return null;
  }

  const organizationRecord: Organization = {
    id: result.id,
    name: result.name,
    slug: result.slug,
    logo: result.logo,
    metadata: result.metadata,
    publicKey: result.publicKey,
    createdAt: result.createdAt,
  };

  await cache.set(
    cacheKey,
    JSON.stringify({
      ...organizationRecord,
      createdAt: organizationRecord.createdAt.toISOString(),
    }),
    ttlSeconds,
  );

  return organizationRecord;
}

/**
 * Resolve organization from request headers
 * Tries multiple strategies:
 * 1. X-Forwarded-Host header
 * 2. Host header
 * 3. Origin header
 */
export async function resolveOrganizationFromHeaders(
  db: Database,
  headers: Headers,
  cache: Cache,
): Promise<{ organization: Organization | null; subdomain: string | null }> {
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
    return { organization: null, subdomain: null };
  }

  const org = await getOrganizationBySubdomain(db, subdomain, cache);
  return { organization: org, subdomain };
}
