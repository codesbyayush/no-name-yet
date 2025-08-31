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

export const githubInstallations = pgTable(
  'github_installations',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').references(() => organization.id, {
      onDelete: 'set null',
    }),
    githubInstallationId: integer('github_installation_id').notNull(),
    accountLogin: text('account_login').notNull(),
    accountId: integer('account_id').notNull(),
    appId: integer('app_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    installationUnique: unique().on(table.githubInstallationId),
    accountIdx: index('idx_github_installations_account').on(
      table.accountLogin
    ),
  })
);

export const githubRepositories = pgTable(
  'github_repositories',
  {
    id: text('id').primaryKey(),
    installationId: text('installation_id')
      .references(() => githubInstallations.id, { onDelete: 'cascade' })
      .notNull(),
    repoId: integer('repo_id').notNull(),
    fullName: text('full_name').notNull(),
    name: text('name').notNull(),
    private: boolean('private').default(false).notNull(),
    defaultBranch: text('default_branch'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueRepoPerInstallation: unique().on(table.installationId, table.repoId),
    installationIdx: index('idx_github_repositories_installation').on(
      table.installationId
    ),
  })
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
  (table) => ({
    deliveryUnique: unique().on(table.deliveryId),
    deliveryIdx: index('idx_github_webhook_delivery').on(table.deliveryId),
  })
);
