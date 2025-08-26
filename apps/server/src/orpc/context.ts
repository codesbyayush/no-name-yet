import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { Context as HonoContext } from "hono";
import { getDb } from "../db";
import { organization, user } from "../db/schema";
import { getAuth } from "../lib/auth";
import type { AppEnv } from "../lib/env";

export type CreateContextOptions = {
	context: HonoContext;
	env: AppEnv;
};

export async function createContext({ context, env }: CreateContextOptions) {
	const db = getDb(env);
	const auth = getAuth(env);
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	// Extract subdomain from trusted proxy headers or host
	const xfHost = context.req.raw.headers.get("x-forwarded-host");
	let host =
		(xfHost
			? xfHost.split(",")[0]
			: context.req.raw.headers.get("host")
		)?.trim() || "";
	if (host.includes(":")) {
		host = host.split(":")[0];
	}
	let subdomain: string | undefined;
	if (host && !host.startsWith("localhost")) {
		const parts = host.split(".");
		if (parts.length > 2) {
			const candidate = parts[0];
			if (candidate !== "www" && candidate !== "api") {
				subdomain = candidate;
			}
		}
	}

	if (!subdomain) {
		subdomain = context.req.raw.headers
			.get("origin")
			?.replaceAll("https://", "")
			.split(".")[0];
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
		} catch (error) {}
	}

	return {
		session,
		organization: org,
		subdomain: subdomain || undefined,
		db,
		env,
	};
}

export async function createAdminContext({
	context,
	env,
}: CreateContextOptions) {
	const db = getDb(env);
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
			env,
		};
	} catch (error) {
		return {
			session,
			user: null,
			organization: null,
			db,
			env,
		};
	}
}

export type Context = Awaited<ReturnType<typeof createContext>> & {
	organization: InferSelectModel<typeof organization> | null;
	subdomain?: string;
	db: ReturnType<typeof getDb>;
	env: AppEnv;
};

export type AdminContext = Awaited<ReturnType<typeof createAdminContext>> & {
	user: InferSelectModel<typeof user> | null;
	organization: InferSelectModel<typeof organization> | null;
	db: ReturnType<typeof getDb>;
	env: AppEnv;
};
