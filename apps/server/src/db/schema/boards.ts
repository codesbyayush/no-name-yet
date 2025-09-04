import {
  boolean,
  index,
  pgTable,
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
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    isPrivate: boolean('is_private').default(false),
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
