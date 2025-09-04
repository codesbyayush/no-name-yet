import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organization } from './organization';

export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    name: text('name').notNull(),
    color: text('color').notNull().default('blue'),
    type: text('type').notNull().default('feedback'),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueOrganizationName: unique().on(table.organizationId, table.name),
    organizationIdx: index('idx_tags_organization').on(table.organizationId),
    nameLowerIdx: index('idx_tags_org_name_lower').on(
      table.organizationId,
      table.name
    ),
  })
);

// Export types for TypeScript
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
