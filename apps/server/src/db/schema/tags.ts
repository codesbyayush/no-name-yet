import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { organization } from "./organization";

// Tags table for predefined tags
export const tags = pgTable(
	"tags",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		color: text("color").notNull().default("blue"),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		uniqueOrganizationName: unique().on(table.organizationId, table.name),
		organizationIdx: index("idx_tags_organization").on(table.organizationId),
	}),
);

// Export types for TypeScript
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
