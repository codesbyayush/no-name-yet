import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { team } from './organization';

export const githubInstallations = pgTable(
  'github_installations',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id').references(() => team.id, {
      onDelete: 'cascade',
    }),
    githubInstallationId: integer('github_installation_id').notNull(),
    accountLogin: text('account_login').notNull(),
    accountId: integer('account_id').notNull(),
    appId: integer('app_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_github_installations_github_installation_id').on(
      table.githubInstallationId,
    ),
    index('idx_github_installations_account').on(table.accountLogin),
  ],
);

export const githubWebhookDeliveries = pgTable(
  'github_webhook_deliveries',
  {
    id: text('id').primaryKey(),
    deliveryId: text('delivery_id').notNull(),
    event: text('event').notNull(),
    payloadHash: text('payload_hash'),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
    handledAt: timestamp('handled_at'),
  },
  (table) => [
    uniqueIndex('idx_github_webhook_deliveries_delivery_id').on(
      table.deliveryId,
    ),
  ],
);
