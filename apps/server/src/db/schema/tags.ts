import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { team } from './organization';

export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    name: text('name').notNull(),
    color: text('color').notNull().default('blue'),
    type: text('type').notNull().default('feedback'),
    teamId: text('team_id').references(() => team.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_tags_team_id_name').on(table.teamId, table.name),
    index('idx_tags_team_id').on(table.teamId),
    index('idx_tags_team_id_name_lower').on(table.teamId, table.name),
  ],
);

// Export types for TypeScript
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
