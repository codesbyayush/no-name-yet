import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { organization } from './organization';
import { tags } from './tags';

// Enum for changelog status
export const changelogStatusEnum = pgEnum('changelog_status', [
  'draft',
  'published',
  'archived',
]);

// Changelog table - stores all changelog entries
export const changelog = pgTable(
  'changelog',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    // Content and metadata
    title: text('title').notNull(),
    slug: text('slug').notNull(), // URL-friendly identifier
    content: jsonb('content').notNull().$type<any>(), // BlockNote JSON format
    htmlContent: text('html_content'), // Pre-rendered HTML for fast display
    excerpt: text('excerpt'), // Auto-generated or manual summary

    // Publishing control
    status: changelogStatusEnum('status').default('draft').notNull(),
    publishedAt: timestamp('published_at'),

    // Authoring
    authorId: text('author_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // SEO and metadata
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    tagId: text('tag_id').references(() => tags.id, { onDelete: 'cascade' }),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_changelog_organization_id').on(table.organizationId),
    index('idx_changelog_status').on(table.status),
    index('idx_changelog_published').on(table.publishedAt),
    index('idx_changelog_organization_id_slug').on(
      table.organizationId,
      table.slug
    ),
    index('idx_changelog_author').on(table.authorId),
  ]
);

export type Changelog = typeof changelog.$inferSelect;
export type NewChangelog = typeof changelog.$inferInsert;
