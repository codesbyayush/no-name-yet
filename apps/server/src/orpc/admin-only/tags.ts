import { eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { boards } from '../../db/schema/boards';
import { feedback } from '../../db/schema/feedback';
import { tags } from '../../db/schema/tags';
import { adminOnlyProcedure } from '../procedures';

export const tagsRouter = {
  getAll: adminOnlyProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
      )
    )
    .handler(async ({ context }) => {
      if (!context.organization?.id) {
        throw new Error('Organization not found');
      }

      // Get all tags for this organization
      const organizationTags = await context.db
        .select()
        .from(tags)
        .where(eq(tags.organizationId, context.organization.id));

      return organizationTags;
    }),

  create: adminOnlyProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().default('blue'),
      })
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        organizationId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.organization?.id) {
        throw new Error('Organization not found');
      }

      const tagId = crypto.randomUUID();

      const [newTag] = await context.db
        .insert(tags)
        .values({
          id: tagId,
          name: input.name.trim(),
          color: input.color,
          organizationId: context.organization.id,
        })
        .returning();

      return newTag;
    }),

  delete: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        deletedTag: z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      })
    )
    .handler(async ({ input, context }) => {
      if (!context.organization?.id) {
        throw new Error('Organization not found');
      }

      const [deletedTag] = await context.db
        .delete(tags)
        .where(eq(tags.id, input.id))
        .returning();

      if (!deletedTag) {
        throw new Error('Tag not found');
      }

      return { success: true, deletedTag };
    }),
};
