import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { team } from './organization';

// Boards table for hierarchical board structure
export const boards = pgTable(
  'boards',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    teamId: text('team_id').references(() => team.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    isPrivate: boolean('is_private').default(false),
    isSystem: boolean('is_system').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('idx_boards_team_id_slug').on(table.teamId, table.slug),
    index('idx_boards_team_id').on(table.teamId),
    index('idx_boards_slug').on(table.slug),
  ],
);

// Export types for TypeScript
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
