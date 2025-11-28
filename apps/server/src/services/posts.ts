import type { Database } from '@/dal/posts';
import {
  type AdminCreatePostInput,
  type AdminUpdatePostInput,
  createAdminPost as dalCreateAdminPost,
  createPublicPost as dalCreatePublicPost,
  deleteAdminPost as dalDeleteAdminPost,
  deletePublicPost as dalDeletePublicPost,
  updateAdminPost as dalUpdateAdminPost,
  findFeedbackByIssueKey,
  type GetAdminPostsFilters,
  type GetPostsFilters,
  getAdminAllPosts,
  getAdminDetailedPosts,
  getAdminDetailedSinglePost,
  getAndUpdatePostSerialCount,
  getPostById,
  getPostsWithAggregates,
  type PublicCreatePostInput,
} from '@/dal/posts';

/**
 * Get posts with aggregates for public view
 * Business logic: Filters by board privacy and user ownership
 */
export async function getPublicPosts(
  db: Database,
  filters: GetPostsFilters,
  userId?: string,
) {
  return await getPostsWithAggregates(db, filters, userId);
}

/**
 * Get single post by ID for public view
 */
export async function getPublicPost(
  db: Database,
  feedbackId: string,
  userId?: string,
) {
  return await getPostById(db, feedbackId, userId);
}

/**
 * Get admin posts with details
 * Business logic: Lists posts for team admin with filtering options
 */
export async function getAdminPosts(
  db: Database,
  filters: GetAdminPostsFilters,
  userId?: string,
) {
  return await getAdminDetailedPosts(db, filters, userId);
}

/**
 * Get single admin post with details
 */
export async function getAdminPost(
  db: Database,
  feedbackId: string,
  userId?: string,
) {
  return await getAdminDetailedSinglePost(db, feedbackId, userId);
}

/**
 * Get all posts (admin only)
 */
export async function getAllPosts(db: Database) {
  return await getAdminAllPosts(db);
}

/**
 * Create a new admin post
 * Business logic: Delegates to DAL which handles issue key generation and activity logging
 */
export async function createPost(
  db: Database,
  input: AdminCreatePostInput,
  authorId: string,
  teamId: string,
) {
  return await dalCreateAdminPost(db, input, authorId, teamId);
}

/**
 * Update an admin post
 * Business logic: Delegates to DAL which handles change tracking and activity logging
 */
export async function updatePost(
  db: Database,
  input: AdminUpdatePostInput,
  userId?: string,
) {
  return await dalUpdateAdminPost(db, input, userId);
}

/**
 * Delete an admin post
 * Business logic: Delegates to DAL which handles activity logging
 */
export async function deletePost(db: Database, id: string, userId?: string) {
  return await dalDeleteAdminPost(db, id, userId);
}

/**
 * Create a public post (from widget/feedback form)
 * Business logic: Creates post in 'pending' status without issue key
 */
export async function createPublicPost(
  db: Database,
  input: PublicCreatePostInput,
  authorId: string,
) {
  return await dalCreatePublicPost(db, input, authorId);
}

/**
 * Delete a public post
 */
export async function deletePublicPost(db: Database, feedbackId: string) {
  return await dalDeletePublicPost(db, feedbackId);
}

/**
 * Promote a feedback request to an issue
 * Business logic: Delegates to DAL which handles issue key assignment and status change
 */
export async function promoteRequest(
  db: Database,
  id: string,
  teamId: string,
  userId?: string,
) {
  const { promoteRequestedIssue } = await import('@/dal/posts');
  return await promoteRequestedIssue(db, id, teamId, userId);
}

/**
 * Find feedback by issue key (for GitHub integration)
 */
export async function findPostByIssueKey(db: Database, issueKey: string) {
  return await findFeedbackByIssueKey(db, issueKey);
}

/**
 * Update feedback status (for GitHub integration)
 */
export async function updatePostStatus(
  db: Database,
  feedbackId: string,
  status: string,
) {
  const { updateFeedbackStatus } = await import('@/dal/posts');
  // Cast to IssueStatus type
  return await updateFeedbackStatus(
    db,
    feedbackId,
    status as
      | 'to-do'
      | 'in-progress'
      | 'completed'
      | 'backlog'
      | 'technical-review'
      | 'paused'
      | 'pending',
  );
}
