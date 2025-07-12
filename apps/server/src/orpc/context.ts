import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { Context as HonoContext } from "hono";
import { getDb } from "../db";
import { organization, user } from "../db/schema";
import { getAuth } from "../lib/auth";

export type CreateContextOptions = {
  context: HonoContext;
  env: Record<string, unknown>;
};

export async function createContext({ context, env }: CreateContextOptions) {
  const db = getDb({ DATABASE_URL: env.DATABASE_URL as string });
  const auth = getAuth(env);
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  // Extract subdomain from host
  const host = context.req.raw.headers.get("origin")?.split("//")[1];
  let subdomain: string | undefined = undefined;
  if (host) {
    const hostParts = host.split(".");
    if (hostParts.length > 1 && hostParts[0] !== "localhost") {
      subdomain = hostParts[0];
    }
  }

  // Fetch organization based on subdomain
  let org = null;
  if (subdomain) {
    try {
      const orgResult = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, subdomain))
        .limit(1);

      org = orgResult[0] || null;
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  }

  return {
    session,
    organization: org,
    subdomain: subdomain || undefined,
    db,
  };
}

export async function createAdminContext({
  context,
  env,
}: CreateContextOptions) {
  const db = getDb({ DATABASE_URL: env.DATABASE_URL as string });
  const auth = getAuth(env);
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  if (!session?.user?.id) {
    return {
      session: null,
      user: null,
      organization: null,
      db,
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
    };
  } catch (error) {
    console.error("Error creating admin context:", error);
    return {
      session,
      user: null,
      organization: null,
      db,
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> & {
  organization: InferSelectModel<typeof organization> | null;
  subdomain?: string;
  db: ReturnType<typeof getDb>;
};

export type AdminContext = Awaited<ReturnType<typeof createAdminContext>> & {
  user: InferSelectModel<typeof user> | null;
  organization: InferSelectModel<typeof organization> | null;
  db: ReturnType<typeof getDb>;
};
