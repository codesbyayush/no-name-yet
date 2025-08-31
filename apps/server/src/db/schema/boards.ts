import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { organization } from './organization';

// Boards table for hierarchical board structure
export const boards = pgTable(
  'boards',
  {
    id: text('id').primaryKey(),
    symbol: text('symbol'),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    isPrivate: boolean('is_private').default(false),
    postCount: integer('post_count').default(0),
    viewCount: integer('view_count').default(0),
    customFields: jsonb('custom_fields'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    uniqueOrganizationSlug: unique().on(table.organizationId, table.slug),
    organizationIdx: index('idx_boards_organization').on(table.organizationId),
    slugIdx: index('idx_boards_slug').on(table.slug),
  })
);

// Export types for TypeScript
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
