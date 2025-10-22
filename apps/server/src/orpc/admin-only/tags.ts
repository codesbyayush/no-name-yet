import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { createTag, deleteTag, getAllTags } from '@/dal/tags';
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
        throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
      }
      return await getAllTags(context.db, context.organization.id);
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
        throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
      }
      const newTag = await createTag(
        context.db,
        context.organization.id,
        input
      );
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
        throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
      }
      const deletedTag = await deleteTag(context.db, input.id);
      if (!deletedTag) {
        throw new ORPCError('NOT_FOUND', { message: 'Tag not found' });
      }
      return { success: true, deletedTag };
    }),
};
