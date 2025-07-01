import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { sql } from "drizzle-orm";

// Organization table
export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    metadata: text("metadata"),
    publicKey: text("public_key").default(sql`gen_random_uuid()::text`),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    slugIdx: index("idx_organization_slug").on(table.slug),
  }),
);

// Member table - links users to organizations with roles
export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    teamId: text("team_id").references(() => team.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    userOrgIdx: index("idx_member_user_org").on(
      table.userId,
      table.organizationId,
    ),
    orgIdx: index("idx_member_org").on(table.organizationId),
    teamIdx: index("idx_member_team").on(table.teamId),
  }),
);

// Invitation table - for inviting users to organizations
export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    status: text("status").notNull(),
    teamId: text("team_id").references(() => team.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    emailOrgIdx: index("idx_invitation_email_org").on(
      table.email,
      table.organizationId,
    ),
    statusIdx: index("idx_invitation_status").on(table.status),
    expiresIdx: index("idx_invitation_expires").on(table.expiresAt),
  }),
);

// Team table - optional teams within organizations
export const team = pgTable(
  "team",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    orgIdx: index("idx_team_org").on(table.organizationId),
  }),
);
