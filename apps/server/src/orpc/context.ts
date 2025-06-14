import type { Context as HonoContext } from "hono";
import { auth } from "../lib/auth";
import { db } from "../db";
import { organization } from "../db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  // Extract subdomain from host
  const host = context.req.raw.headers.get("origin")?.split("//")[1];
  let subdomain = null;
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
    subdomain
  };
}

export type Context = Awaited<ReturnType<typeof createContext>> & {
  organization: InferSelectModel<typeof organization> | null;
  subdomain?: string
};
