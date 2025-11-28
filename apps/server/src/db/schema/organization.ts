import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

// Organization table
export const organization = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logo: text('logo'),
    metadata: text('metadata'),
    createdAt: timestamp('created_at').notNull(),
  },
  (table) => [uniqueIndex('idx_organization_slug').on(table.slug)],
);

export const team = pgTable('team', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  logo: text('logo'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  publicKey: text('public_key').default(sql`gen_random_uuid()::text`),
});

export const teamMember = pgTable(
  'team_member',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_team_member_team_id_user_id').on(
      table.teamId,
      table.userId,
    ),
  ],
);

export const member = pgTable(
  'member',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    createdAt: timestamp('created_at').notNull(),
  },
  (table) => [
    index('idx_member_user_org').on(table.userId, table.organizationId),
    index('idx_member_org').on(table.organizationId),
  ],
);

// Invitation table - for inviting users to organizations
export const invitation = pgTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    status: text('status').notNull(),
    teamId: text('team_id'),
    expiresAt: timestamp('expires_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_invitation_email_org').on(table.email, table.organizationId),
    index('idx_invitation_status').on(table.status),
    index('idx_invitation_expires').on(table.expiresAt),
  ],
);

export type Team = typeof team.$inferSelect;
export type NewTeam = typeof team.$inferInsert;

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;
