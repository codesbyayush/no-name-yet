import { getDb } from "@/db";
import { boards } from "@/db/schema/boards";
import { feedback } from "@/db/schema/feedback";
import { organization } from "@/db/schema/organization";
import { statuses } from "@/db/schema/statuses";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod/v4";
import { getEnvFromContext } from "../lib/env";

type AppContext = {
	Variables: {
		organization: {
			id: string;
			// attach a list of allowed domains for CORS checks.
			// allowedDomains: string[];
		};
	};
};

const publicApiRouter = new Hono<AppContext>();

publicApiRouter.use("*", async (c, next) => {
	const publicKey = c.req.header("X-Public-Key");

	if (!publicKey) {
		return c.json(
			{ error: "Unauthorized", message: "API key is missing." },
			401,
		);
	}

	try {
		const env = getEnvFromContext(c);
		const db = getDb({ DATABASE_URL: env.DATABASE_URL });
		const org = await db
			.select()
			.from(organization)
			.where(eq(organization.publicKey, publicKey));

		if (!org || org.length === 0) {
			return c.json(
				{ error: "Unauthorized", message: "Invalid API key." },
				401,
			);
		}

		// --- Domain Whitelisting (CORS) ---
		// const origin = c.req.header("Origin");
		// if (process.env.NODE_ENV === "production" && !org.allowedDomains.includes(origin)) {
		//   return c.json({ error: "Forbidden", message: "This domain is not authorized to access the API." }, 403);
		// }

		c.set("organization", org[0]);
	} catch (error) {
		return c.json({ error: "Internal Server Error" }, 500);
	}

	await next();
});

/**
 * GET /public/boards
 *
 * @returns {Array<Object>} A list of board objects with limited public fields.
 */
publicApiRouter.get("/boards", async (c) => {
	const org = c.get("organization");

	try {
		const env = getEnvFromContext(c);
		const db = getDb({ DATABASE_URL: env.DATABASE_URL });
		const publicBoards = await db
			.select({
				id: boards.id,
				name: boards.name,
				slug: boards.slug,
				description: boards.description,
			})
			.from(boards)
			.where(
				and(
					eq(boards.organizationId, org.id),
					eq(boards.isPrivate, false),
					isNull(boards.deletedAt),
				),
			);

		return c.json(publicBoards);
	} catch (error) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

/**
 * GET /public/roadmap
 * Returns statuses and up to 50 items per status for the organization.
 */
publicApiRouter.get("/roadmap", async (c) => {
	const org = c.get("organization");

	try {
		const env = getEnvFromContext(c);
		const db = getDb({ DATABASE_URL: env.DATABASE_URL });

		const orgStatuses = await db
			.select({
				id: statuses.id,
				key: statuses.key,
				name: statuses.name,
				color: statuses.color,
				order: statuses.order,
			})
			.from(statuses)
			.where(eq(statuses.organizationId, org.id))
			.orderBy(asc(statuses.order));

		const results = [] as Array<{
			id: string;
			key: string;
			name: string;
			color: string | null;
			order: number | null;
			items: Array<{
				id: string;
				title: string | null;
				description: string;
				boardId: string;
				createdAt: Date | null;
			}>;
		}>;

		for (const st of orgStatuses) {
			const items = await db
				.select({
					id: feedback.id,
					title: feedback.title,
					description: feedback.description,
					boardId: feedback.boardId,
					createdAt: feedback.createdAt,
				})
				.from(feedback)
				.innerJoin(boards, eq(feedback.boardId, boards.id))
				.where(
					and(
						eq(feedback.statusId, st.id),
						eq(boards.organizationId, org.id),
						eq(boards.isPrivate, false),
						isNull(boards.deletedAt),
					),
				)
				.limit(50);

			results.push({ ...st, items });
		}

		return c.json({ statuses: results });
	} catch (error) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

/**
 * GET /public/tags
 * @returns {Array<string>} A flat list of unique tag strings.
 */
publicApiRouter.get("/tags", async (c) => {
	const org = c.get("organization");

	try {
		const env = getEnvFromContext(c);
		const db = getDb({ DATABASE_URL: env.DATABASE_URL });
		const orgBoards = await db
			.select({ id: boards.id })
			.from(boards)
			.where(and(eq(boards.organizationId, org.id), isNull(boards.deletedAt)));

		if (orgBoards.length === 0) {
			return c.json([]); // No boards, so no tags
		}
		const boardIdList = orgBoards.map((b) => b.id);

		const tagsResult = await db.execute(sql`
        SELECT DISTINCT unnest(tags) as tag
        FROM feedback
        WHERE board_id IN ${inArray(feedback.boardId, boardIdList)}
          AND tags IS NOT NULL AND cardinality(tags) > 0
        ORDER BY tag;
    `);

		const tags = (tagsResult.rows as { tag: string }[]).map((row) => row.tag);

		return c.json(tags);
	} catch (error) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

const feedbackSubmissionSchema = z.object({
	boardId: z.string(),
	type: z.enum(["bug", "suggestion"]),
	description: z.string().min(1, "Description cannot be empty."),
	severity: z.enum(["low", "medium", "high", "critical"]).optional(),
	user: z
		.object({
			id: z.string().optional(),
			name: z.string().optional(),
			email: z.string().email().optional(),
		})
		.optional(),
	customData: z.record(z.any(), z.any()).optional(),
	browserInfo: z.object({
		userAgent: z.string(),
		url: z.string(),
		platform: z.string().optional(),
		language: z.string().optional(),
		cookieEnabled: z.boolean().optional(),
		onLine: z.boolean().optional(),
		screenResolution: z.string().optional(),
	}),
});

/**
 * POST /public/feedback
 *
 * Submits new feedback from the public widget.
 * The request is validated against a Zod schema to ensure type safety.
 *
 * It performs a crucial security check to ensure the provided `boardId`
 * belongs to the organization associated with the `X-Public-Key`.
 *
 * @returns {Object} A success message and the ID of the created feedback.
 */
publicApiRouter.post("/feedback", async (c) => {
	const org = c.get("organization");
	const body = await c.req.json();

	const validation = feedbackSubmissionSchema.safeParse(body);
	if (!validation.success) {
		return c.json(
			{ error: "Invalid input", details: validation.error.flatten() },
			400,
		);
	}

	const {
		boardId,
		type,
		description,
		severity,
		user,
		customData, // Note: customData is captured but not yet stored in the DB.
		browserInfo,
	} = validation.data;

	// Security Check: Verify the board belongs to the organization.
	// This prevents a user from one org from submitting feedback to a board of another org.
	try {
		const env = getEnvFromContext(c);
		const db = getDb({ DATABASE_URL: env.DATABASE_URL });
		const board = await db.query.boards.findFirst({
			where: and(eq(boards.id, boardId), eq(boards.organizationId, org.id)),
			columns: { id: true },
		});

		if (!board) {
			return c.json(
				{ error: "Forbidden", message: "Board not found or access denied." },
				403,
			);
		}

		const { userAgent, url, ...restOfBrowserInfo } = browserInfo;

		// Determine default status for new feedback (prefer key "open"; otherwise first by order)
		const defaultStatus = await db
			.select({ id: statuses.id, key: statuses.key, order: statuses.order })
			.from(statuses)
			.where(eq(statuses.organizationId, org.id))
			.orderBy(asc(statuses.order))
			.limit(1);
		const statusId = defaultStatus[0]?.id;
		if (!statusId) {
			return c.json({ error: "No statuses configured for organization" }, 500);
		}

		const [newFeedbackItem] = await db
			.insert(feedback)
			.values({
				boardId,
				type,
				description,
				// Auto-generate a title from the description
				title: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${description.substring(0, 50)}`,
				statusId,
				// Note: The 'severity' field is not present in the current database schema.
				userId: user?.id,
				userName: user?.name,
				userEmail: user?.email,
				userAgent: userAgent,
				url: url,
				browserInfo: restOfBrowserInfo,
				// The 'feedback' schema would need a 'customData' jsonb column to store this.
				// customData: customData,
			})
			.returning({ id: feedback.id });

		return c.json({ success: true, feedbackId: newFeedbackItem.id }, 201);
	} catch (error) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export default publicApiRouter;
