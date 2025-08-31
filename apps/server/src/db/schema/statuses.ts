import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { organization } from './organization';

// Per-organization statuses for feedback lifecycle
export const statuses = pgTable(
  'statuses',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    key: text('key').notNull(), // stable identifier, e.g. "open", "in_progress"
    name: text('name').notNull(), // display name
    color: text('color').default('gray'),
    order: integer('order').default(0),
    isTerminal: boolean('is_terminal').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueOrgKey: unique().on(table.organizationId, table.key),
    orgIdx: index('idx_statuses_organization').on(table.organizationId),
    orderIdx: index('idx_statuses_org_order').on(
      table.organizationId,
      table.order
    ),
  })
);

export type Status = typeof statuses.$inferSelect;
export type NewStatus = typeof statuses.$inferInsert;
