import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { createTag, deleteTag, getAllTags } from '@/services/tags';
import { adminOnlyProcedure } from '../procedures';

export const tagsRouter = {
  getAll: adminOnlyProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
    )
    .handler(async ({ context }) => {
      if (!context.team?.id) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      return await getAllTags(context.db, context.team.id, context.cache);
    }),

  create: adminOnlyProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().default('blue'),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        teamId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!context.team?.id) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      const newTag = await createTag(
        context.db,
        context.team.id,
        input,
        context.cache,
      );

      if (!newTag) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create tag',
        });
      }

      return newTag;
    }),

  delete: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        deletedTag: z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!context.team?.id) {
        throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
      }

      const deletedTag = await deleteTag(
        context.db,
        context.team.id,
        input.id,
        context.cache,
      );

      if (!deletedTag) {
        throw new ORPCError('NOT_FOUND', { message: 'Tag not found' });
      }

      return { success: true, deletedTag };
    }),
};
