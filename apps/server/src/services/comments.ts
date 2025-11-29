import {
  type CreateCommentInput,
  countPublicComments,
  createComment as dalCreateComment,
  deleteComment as dalDeleteComment,
  updateComment as dalUpdateComment,
  listTopLevelComments,
  type UpdateCommentInput,
} from '@/dal/comments';
import type { Database } from '@/db';

/**
 * Create a new comment
 */
export async function createComment(
  db: Database,
  input: CreateCommentInput,
  authorId: string | undefined,
) {
  return await dalCreateComment(db, input, authorId);
}

/**
 * Update a comment
 */
export async function updateComment(db: Database, input: UpdateCommentInput) {
  return await dalUpdateComment(db, input);
}

/**
 * Delete a comment
 */
export async function deleteComment(db: Database, commentId: string) {
  return await dalDeleteComment(db, commentId);
}

/**
 * List top-level comments for a feedback post
 */
export async function getPostComments(db: Database, feedbackId: string) {
  return await listTopLevelComments(db, feedbackId);
}

/**
 * Count public comments for a feedback post
 */
export async function getCommentCount(db: Database, feedbackId: string) {
  return await countPublicComments(db, feedbackId);
}
