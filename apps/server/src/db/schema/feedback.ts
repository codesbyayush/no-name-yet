import { sql } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { boards } from "./boards";
import { organization } from "./organization";
import { statuses } from "./statuses";
import { tags } from "./tags";

// Enum for feedback types
export const feedbackTypeEnum = pgEnum("feedback_type", ["bug", "suggestion"]);

// Enum for feedback severity (for bugs)
export const severityEnum = pgEnum("severity", [
	"low",
	"medium",
	"high",
	"critical",
]);

// Enum for plan types
export const planTypeEnum = pgEnum("plan_type", [
	"starter",
	"pro",
	"enterprise",
]);

// Feedback table - stores all feedback submissions
export const feedback = pgTable(
	"feedback",
	{
		id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
		boardId: text("board_id")
			.notNull()
			.references(() => boards.id, { onDelete: "cascade" }),
		type: feedbackTypeEnum("type").notNull(),
		title: text("title"),
		description: text("description").notNull(),
		statusId: text("status_id")
			.notNull()
			.references(() => statuses.id, { onDelete: "restrict" }),
		// Need to rethink there: user can be from tenant that we do not have in our db
		userId: text("user_id"),
		userEmail: text("user_email"),
		userName: text("user_name"),

		userAgent: text("user_agent"),
		url: text("url"),
		browserInfo: jsonb("browser_info").$type<{
			platform?: string;
			language?: string;
			cookieEnabled?: boolean;
			onLine?: boolean;
			screenResolution?: string;
			userAgent?: string;
			url?: string;
		}>(),

		// Attachments and media
		attachments: jsonb("attachments").default([]).$type<
			Array<{
				id: string;
				name: string;
				type: string; // image/png, application/pdf, etc.
				size: number;
				url: string; // S3 URL or similar
			}>
		>(),

		// AI processing results (will be added in Phase 3)
		aiAnalysis: jsonb("ai_analysis").$type<{
			category?: string;
			sentiment?: string;
			summary?: string;
			suggestedResponse?: string;
			confidence?: number;
		}>(),

		// Custom data from the user
		metadata: jsonb("metadata").$type<Record<string, unknown>>(),

		// Metadata
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),

		// For future features
		isAnonymous: boolean("is_anonymous").default(false).notNull(),
		priority: text("priority").default("medium"), // low, medium, high
	},
	(table) => ({
		boardsIdx: index("idx_feedback_boards").on(table.boardId),
		statusIdx: index("idx_feedback_status").on(table.statusId),
		boardStatusCreatedIdx: index("idx_feedback_board_status_created").on(
			table.boardId,
			table.statusId,
			table.createdAt.desc(),
		),
		statusCreatedIdx: index("idx_feedback_status_created").on(
			table.statusId,
			table.createdAt.desc(),
		),
		typeIdx: index("idx_feedback_type").on(table.type),
	}),
);

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
