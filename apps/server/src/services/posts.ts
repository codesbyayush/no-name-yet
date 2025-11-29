import { type ActivityAction, createActivityLog } from '@/dal/activity';
import { getTeamDetails } from '@/dal/organization';
import {
  type CreatePostData,
  create,
  createPublicPost as dalCreatePublicPost,
  deletePublicPost as dalDeletePublicPost,
  deleteById,
  findById,
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
  type UpdatePostData,
  update,
  updateFeedbackStatus,
} from '@/dal/posts';
import type { Database } from '@/db';
import type { PriorityEnum, StatusEnum } from '@/db/schema';
import { generateIssueKey } from './issue';

export type AdminCreatePostInput = {
  boardId?: string;
  teamId?: string;
  title: string;
  description: string;
  priority: PriorityEnum;
  status: StatusEnum;
  tags?: string[];
  issueKey?: string;
  assigneeId?: string;
};

export type AdminUpdatePostInput = {
  id: string;
  title?: string;
  description?: string;
  status?: StatusEnum;
  priority?: PriorityEnum;
  boardId?: string;
  dueDate?: string;
  completedAt?: string;
  assigneeId?: string | null;
  tags?: string[];
};

type FieldChange = {
  action: ActivityAction;
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

/**
 * Detect changes between old and new post states
 * Pure business logic - no database access
 */
function detectPostChanges(
  currentPost: NonNullable<Awaited<ReturnType<typeof findById>>>,
  input: AdminUpdatePostInput,
): FieldChange[] {
  const changes: FieldChange[] = [];

  // Title change
  if (input.title !== undefined && input.title !== currentPost.title) {
    changes.push({
      action: 'title_changed',
      field: 'title',
      oldValue: currentPost.title,
      newValue: input.title,
    });
  }

  // Description change
  if (
    input.description !== undefined &&
    input.description !== currentPost.description
  ) {
    changes.push({
      action: 'description_changed',
      field: 'description',
      oldValue: currentPost.description,
      newValue: input.description,
    });
  }

  // Status change
  if (input.status !== undefined && input.status !== currentPost.status) {
    changes.push({
      action: 'status_changed',
      field: 'status',
      oldValue: currentPost.status,
      newValue: input.status,
    });
  }

  // Priority change
  if (input.priority !== undefined && input.priority !== currentPost.priority) {
    changes.push({
      action: 'priority_changed',
      field: 'priority',
      oldValue: currentPost.priority,
      newValue: input.priority,
    });
  }

  // Board change
  if (input.boardId !== undefined && input.boardId !== currentPost.boardId) {
    changes.push({
      action: 'board_changed',
      field: 'boardId',
      oldValue: currentPost.boardId,
      newValue: input.boardId,
    });
  }

  // Due date change
  if (input.dueDate !== undefined) {
    const newDueDate = new Date(input.dueDate);
    const oldDueDate = currentPost.dueDate;
    if (!oldDueDate || oldDueDate.getTime() !== newDueDate.getTime()) {
      changes.push({
        action: 'due_date_changed',
        field: 'dueDate',
        oldValue: oldDueDate,
        newValue: newDueDate,
      });
    }
  }

  // Completed at change
  if (input.completedAt !== undefined) {
    const newCompletedAt = new Date(input.completedAt);
    const oldCompletedAt = currentPost.completedAt;
    if (
      !oldCompletedAt ||
      oldCompletedAt.getTime() !== newCompletedAt.getTime()
    ) {
      changes.push({
        action: 'completed',
        field: 'completedAt',
        oldValue: oldCompletedAt,
        newValue: newCompletedAt,
      });
    }
  }

  // Assignee change
  if (input.assigneeId !== undefined) {
    if (input.assigneeId !== currentPost.assigneeId) {
      if (input.assigneeId === null) {
        changes.push({
          action: 'unassigned',
          field: 'assigneeId',
          oldValue: currentPost.assigneeId,
          newValue: null,
        });
      } else {
        changes.push({
          action: 'assigned',
          field: 'assigneeId',
          oldValue: currentPost.assigneeId,
          newValue: input.assigneeId,
        });
      }
    }
  }

  // Tags change
  if (input.tags !== undefined) {
    const oldTags = currentPost.tags || [];
    const newTags = input.tags || [];
    const oldTagsSet = new Set(oldTags);
    const newTagsSet = new Set(newTags);

    // Find added tags
    for (const tag of newTags) {
      if (!oldTagsSet.has(tag)) {
        changes.push({
          action: 'tag_added',
          field: 'tags',
          oldValue: oldTags,
          newValue: tag,
        });
      }
    }

    // Find removed tags
    for (const tag of oldTags) {
      if (!newTagsSet.has(tag)) {
        changes.push({
          action: 'tag_removed',
          field: 'tags',
          oldValue: tag,
          newValue: newTags,
        });
      }
    }
  }

  return changes;
}

/**
 * Log multiple changes as activity logs
 */
async function logChanges(
  db: Database,
  feedbackId: string,
  userId: string,
  changes: FieldChange[],
): Promise<void> {
  await Promise.all(
    changes.map((change) =>
      createActivityLog(db, {
        feedbackId,
        userId,
        action: change.action,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      }),
    ),
  );
}

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
 * Business logic: Generates issue key based on team name and logs creation
 */
export async function createPost(
  db: Database,
  input: AdminCreatePostInput,
  authorId: string,
  teamId: string,
) {
  // Business logic: Generate issue key
  const teamDetails = await getTeamDetails(db, teamId);
  const teamName = teamDetails[0]?.name;
  const teamSerial = await getAndUpdatePostSerialCount(db, teamId);
  const issueKey = generateIssueKey(teamName, teamSerial);

  // Data access: Create the post
  const postData: CreatePostData = {
    boardId: input.boardId,
    issueKey,
    authorId,
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: input.status,
    tags: input.tags,
    assigneeId: input.assigneeId,
  };

  const newPost = await create(db, postData);

  // Business logic: Log creation activity
  if (newPost) {
    await createActivityLog(db, {
      feedbackId: newPost.id,
      userId: authorId,
      action: 'created',
      metadata: {
        issueKey: newPost.issueKey,
        initialStatus: newPost.status,
        initialPriority: newPost.priority,
      },
    });
  }

  return newPost;
}

/**
 * Update an admin post
 * Business logic: Detects changes and logs activity for each field change
 */
export async function updatePost(
  db: Database,
  input: AdminUpdatePostInput,
  userId?: string,
) {
  // Data access: Get current state
  const currentPost = await findById(db, input.id);
  if (!currentPost) {
    return null;
  }

  // Data access: Update the post
  const updateData: UpdatePostData = {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    boardId: input.boardId,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
    assigneeId: input.assigneeId,
    tags: input.tags,
  };

  const updatedPost = await update(db, input.id, updateData);
  if (!updatedPost || !userId) {
    return updatedPost;
  }

  // Business logic: Detect and log changes
  const changes = detectPostChanges(currentPost, input);
  await logChanges(db, input.id, userId, changes);

  return updatedPost;
}

/**
 * Delete an admin post
 * Business logic: Logs deletion activity with metadata
 */
export async function deletePost(db: Database, id: string, userId?: string) {
  // Data access: Get current state before deleting
  const currentPost = await findById(db, id);

  // Data access: Delete the post
  const deletedPost = await deleteById(db, id);

  // Business logic: Log deletion activity
  if (deletedPost && userId) {
    await createActivityLog(db, {
      feedbackId: id,
      userId,
      action: 'deleted',
      metadata: {
        title: currentPost?.title,
        issueKey: currentPost?.issueKey,
      },
    });
  }

  return deletedPost;
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
 * Business logic: Assigns issue key and changes status to 'to-do'
 */
export async function promoteRequest(
  db: Database,
  id: string,
  teamId: string,
  userId?: string,
) {
  // Data access: Get current state
  const currentPost = await findById(db, id);
  if (!currentPost) {
    return null;
  }

  // Business logic: Generate issue key
  const teamDetails = await getTeamDetails(db, teamId);
  const teamName = teamDetails[0]?.name;
  const teamSerial = await getAndUpdatePostSerialCount(db, teamId);
  const issueKey = generateIssueKey(teamName, teamSerial);

  // Data access: Update the post
  const promotedPost = await update(db, id, {
    status: 'to-do',
    issueKey,
  });

  // Business logic: Log promotion activities
  if (promotedPost && userId) {
    const activityPromises: Promise<unknown>[] = [];

    // Log status change if it changed
    if (currentPost.status !== 'to-do') {
      activityPromises.push(
        createActivityLog(db, {
          feedbackId: id,
          userId,
          action: 'status_changed',
          field: 'status',
          oldValue: currentPost.status,
          newValue: 'to-do',
        }),
      );
    }

    // Log issue key assignment
    if (!currentPost.issueKey) {
      activityPromises.push(
        createActivityLog(db, {
          feedbackId: id,
          userId,
          action: 'updated',
          field: 'issueKey',
          oldValue: null,
          newValue: issueKey,
          metadata: {
            promoted: true,
          },
        }),
      );
    }

    await Promise.all(activityPromises);
  }

  return promotedPost;
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
  status: StatusEnum,
) {
  return await updateFeedbackStatus(db, feedbackId, status);
}
