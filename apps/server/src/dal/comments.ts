import { and, count, eq, isNull } from 'drizzle-orm';
import { comments, user } from '@/db/schema';

export type Database = ReturnType<typeof import('@/db').getDb>;

export type CreateCommentInput = {
  feedbackId: string;
  content: string;
};

export async function createComment(
  db: Database,
  input: CreateCommentInput,
  authorId: string | undefined,
) {
  const [newComment] = await db
    .insert(comments)
    .values({
      feedbackId: input.feedbackId,
      authorId,
      content: input.content,
    })
    .returning();
  return newComment ?? null;
}

export type UpdateCommentInput = {
  id: string;
  content?: string;
};

export async function updateComment(db: Database, input: UpdateCommentInput) {
  const [updatedComment] = await db
    .update(comments)
    .set({
      ...(input.content && { content: input.content }),
    })
    .where(eq(comments.id, input.id))
    .returning();
  return updatedComment ?? null;
}

export async function deleteComment(db: Database, commentId: string) {
  const [deletedComment] = await db
    .delete(comments)
    .where(eq(comments.id, commentId))
    .returning();
  return deletedComment ?? null;
}

export async function listTopLevelComments(db: Database, feedbackId: string) {
  return await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      author: {
        name: user.name,
        image: user.image,
      },
    })
    .from(comments)
    .leftJoin(user, eq(comments.authorId, user.id))
    .where(
      and(
        eq(comments.feedbackId, feedbackId),
        isNull(comments.parentCommentId),
        isNull(comments.deletedAt),
        eq(comments.isInternal, false),
      ),
    );
}

export async function countPublicComments(db: Database, feedbackId: string) {
  const totalCount = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.feedbackId, feedbackId),
        isNull(comments.deletedAt),
        eq(comments.isInternal, false),
      ),
    );
  return totalCount[0]?.count || 0;
}
