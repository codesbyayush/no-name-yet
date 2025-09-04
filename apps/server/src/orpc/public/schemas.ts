import { z } from 'zod';

// Base schemas for reuse
export const changelogStatusSchema = z.enum(['draft', 'published', 'archived']);

export const paginationSchema = z.object({
  offset: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export const sortBySchema = z
  .enum(['newest', 'oldest', 'title'])
  .default('newest');

// Content schemas
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug too long')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  );

export const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title too long');

export const excerptSchema = z.string().max(500, 'Excerpt too long');

export const metaTitleSchema = z.string().max(200, 'Meta title too long');

export const metaDescriptionSchema = z
  .string()
  .max(500, 'Meta description too long');

export const contentSchema = z.any().optional().default([]);

export const htmlContentSchema = z.string().optional();

// Main CRUD schemas
export const createChangelogSchema = z.object({
  title: titleSchema,
  slug: slugSchema.optional(),
  content: contentSchema,
  htmlContent: htmlContentSchema,
  excerpt: excerptSchema.optional(),
  status: changelogStatusSchema.default('draft'),
  publishedAt: z.date().optional(),
  tagId: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  metaTitle: metaTitleSchema.optional(),
  metaDescription: metaDescriptionSchema.optional(),
});

export const updateChangelogSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: titleSchema.optional(),
  slug: slugSchema.optional(),
  content: z.any().optional(),
  htmlContent: htmlContentSchema,
  excerpt: excerptSchema.optional(),
  status: changelogStatusSchema.optional(),
  publishedAt: z.date().optional(),
  tagId: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  metaTitle: metaTitleSchema.optional(),
  metaDescription: metaDescriptionSchema.optional(),
});

export const getChangelogSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const deleteChangelogSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const getAllChangelogsSchema = z.object({
  ...paginationSchema.shape,
  status: changelogStatusSchema.optional(),
  tagId: z.string().optional(),
  sortBy: sortBySchema,
});

export const updateAllChangelogsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
  updates: z.object({
    status: changelogStatusSchema.optional(),
    tagId: z.string().optional(),
    publishedAt: z.date().optional(),
  }),
});

// Public schemas
export const publicGetChangelogsSchema = z.object({
  ...paginationSchema.shape,
  tagId: z.string().optional(),
  sortBy: sortBySchema,
});

export const publicGetChangelogBySlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

// Bulk operation schemas
export const bulkDeleteChangelogsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
});

export const bulkPublishChangelogsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
  publish: z.boolean(),
});

// Type exports for reuse
export type CreateChangelogInput = z.infer<typeof createChangelogSchema>;
export type UpdateChangelogInput = z.infer<typeof updateChangelogSchema>;
export type GetChangelogInput = z.infer<typeof getChangelogSchema>;
export type DeleteChangelogInput = z.infer<typeof deleteChangelogSchema>;
export type GetAllChangelogsInput = z.infer<typeof getAllChangelogsSchema>;
export type UpdateAllChangelogsInput = z.infer<
  typeof updateAllChangelogsSchema
>;
export type PublicGetChangelogsInput = z.infer<
  typeof publicGetChangelogsSchema
>;
export type PublicGetChangelogBySlugInput = z.infer<
  typeof publicGetChangelogBySlugSchema
>;
export type BulkDeleteChangelogsInput = z.infer<
  typeof bulkDeleteChangelogsSchema
>;
export type BulkPublishChangelogsInput = z.infer<
  typeof bulkPublishChangelogsSchema
>;
export type ChangelogStatus = z.infer<typeof changelogStatusSchema>;
