import {
  aliasedTable,
  and,
  asc,
  desc,
  eq,
  exists,
  ne,
  or,
  type SQL,
  sql,
} from 'drizzle-orm';
import {
  boards,
  comments,
  feedback,
  type StatusEnum,
  team,
  teamSerials,
  user,
  votes,
} from '@/db/schema';
import { generateIssueKey } from '@/services/issue';
import { type ActivityAction, createActivityLog } from './activity';
import { getTeamDetails } from './organization';

export type Database = ReturnType<typeof import('@/db').getDb>;

export type GetPostsFilters = {
  teamId: string;
  boardId?: string;
  offset: number;
  take: number;
  sortBy?: 'newest' | 'oldest';
};

export type IssuePriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'no-priority';

export async function getPostsWithAggregates(
  db: Database,
  filters: GetPostsFilters,
  userId?: string,
) {
  const orderBy: SQL<unknown> = ((): SQL<unknown> => {
    switch (filters.sortBy) {
      case 'oldest':
        return asc(feedback.createdAt);
      default:
        return desc(feedback.createdAt);
    }
  })();

  // (If the board is public and status is not pending) or user is the author -> show the posts
  const whereFilters = [
    eq(boards.teamId, filters.teamId),
    or(
      and(eq(boards.isPrivate, false), ne(feedback.status, 'pending')),
      eq(feedback.authorId, userId ?? ''),
    ),
  ] as SQL<unknown>[];
  if (filters.boardId) {
    whereFilters.push(eq(boards.id, filters.boardId));
  }

  const rows = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      createdAt: feedback.createdAt,
      status: feedback.status,
      boardId: feedback.boardId,
      author: {
        name: user.name,
        avatarUrl: user.image,
        email: user.email,
      },
      hasVoted: sql<boolean>`(select exists(select 1 from ${votes} where ${votes.feedbackId} = ${feedback.id} and ${votes.userId} = ${userId}))`,
      commentCount: sql<number>`(select count(*) from ${comments} where ${comments.feedbackId} = ${feedback.id})`,
      voteCount: sql<number>`(select count(*) from ${votes} where ${votes.feedbackId} = ${feedback.id})`,
    })
    .from(feedback)
    .leftJoin(user, eq(feedback.authorId, user.id))
    .leftJoin(boards, eq(feedback.boardId, boards.id))
    .where(and(...whereFilters))
    .orderBy(orderBy)
    .offset(filters.offset)
    .limit(filters.take + 1);

  const hasMore = rows.length > filters.take;
  return {
    posts: rows.slice(0, filters.take),
    hasMore,
  };
}

export async function getPostById(
  db: Database,
  feedbackId: string,
  userId?: string,
) {
  const rows = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      boardId: feedback.boardId,
      description: feedback.description,
      createdAt: feedback.createdAt,
      status: feedback.status,
      author: {
        name: user.name,
        avatarUrl: user.image,
        email: user.email,
      },
      hasVoted: sql<boolean>`(select exists(select 1 from ${votes} where ${votes.feedbackId} = ${feedback.id} and ${votes.userId} = ${userId}))`,
      commentCount: sql<number>`(select count(*) from ${comments} where ${comments.feedbackId} = ${feedback.id})`,
      voteCount: sql<number>`(select count(*) from ${votes} where ${votes.feedbackId} = ${feedback.id})`,
    })
    .from(feedback)
    .leftJoin(user, eq(feedback.authorId, user.id))
    .where(eq(feedback.id, feedbackId));

  return rows[0] ?? null;
}

export type GetAdminPostsFilters = {
  teamId: string;
  boardId?: string;
  offset: number;
  take: number;
  sortBy?: 'newest' | 'oldest' | 'most_voted';
};

export async function getAdminDetailedPosts(
  db: Database,
  filters: GetAdminPostsFilters,
  userId?: string,
) {
  const orderBy: SQL<unknown> = ((): SQL<unknown> => {
    switch (filters.sortBy) {
      case 'oldest':
        return asc(feedback.createdAt);
      case 'most_voted':
        // TODO: Implement sort by vote count; keep createdAt for parity with current API
        return desc(feedback.createdAt);
      default:
        return desc(feedback.createdAt);
    }
  })();

  const whereFilters = [] as SQL<unknown>[];
  if (filters.boardId) {
    whereFilters.push(eq(boards.id, filters.boardId));
  }

  const creatorUser = aliasedTable(user, 'creator');

  const rows = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      issueKey: feedback.issueKey,
      boardId: feedback.boardId,
      priority: feedback.priority,
      status: feedback.status,
      assigneeId: feedback.assigneeId,
      dueDate: feedback.dueDate,
      completedAt: feedback.completedAt,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      tags: feedback.tags,
      author: {
        id: creatorUser.id,
        name: creatorUser.name,
        email: creatorUser.email,
        avatarUrl: creatorUser.image,
      },
      hasVoted: userId
        ? exists(
            db
              .select()
              .from(votes)
              .where(
                and(
                  eq(votes.feedbackId, feedback.id),
                  eq(votes.userId, userId),
                ),
              ),
          )
        : sql`false`,
    })
    .from(feedback)
    .leftJoin(creatorUser, eq(feedback.authorId, creatorUser.id))
    .where(and(...whereFilters))
    .orderBy(orderBy)
    .offset(filters.offset)
    .limit(filters.take + 1);

  const hasMore = rows.length > filters.take;
  return { posts: rows, hasMore };
}

export async function getAdminDetailedSinglePost(
  db: Database,
  feedbackId: string,
  userId?: string,
) {
  const row = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      boardId: feedback.boardId,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.image,
      },
      board: { id: boards.id, name: boards.name, slug: boards.slug },
      hasVoted: userId
        ? exists(
            db
              .select()
              .from(votes)
              .where(
                and(
                  eq(votes.feedbackId, feedback.id),
                  eq(votes.userId, userId),
                ),
              ),
          )
        : sql`false`,
    })
    .from(feedback)
    .leftJoin(user, eq(feedback.authorId, user.id))
    .leftJoin(boards, eq(feedback.boardId, boards.id))
    .where(eq(feedback.id, feedbackId));

  return row[0] ?? null;
}

export type AdminCreatePostInput = {
  boardId?: string;
  teamId?: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: StatusEnum;
  tags?: string[];
  issueKey?: string;
  assigneeId?: string;
};

export async function createAdminPost(
  db: Database,
  input: AdminCreatePostInput,
  authorId: string,
  teamId: string,
) {
  const teamDetails = await getTeamDetails(db, teamId);
  const teamName = teamDetails[0]?.name;

  const teamSerial = await getAndUpdatePostSerialCount(db, teamId);

  const issueKey = generateIssueKey(teamName, teamSerial);

  const [newPost] = await db
    .insert(feedback)
    .values({
      ...(input.boardId && { boardId: input.boardId }),
      issueKey,
      authorId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status,
      ...(input.tags && input.tags.length > 0 && { tags: input.tags }),
      ...(input.assigneeId && { assigneeId: input.assigneeId }),
    })
    .returning();

  // Log creation activity
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

export type AdminUpdatePostInput = {
  id: string;
  title?: string;
  description?: string;
  status?: StatusEnum;
  priority?: IssuePriority;
  boardId?: string;
  dueDate?: string;
  completedAt?: string;
  assigneeId?: string | null;
  tags?: string[];
};

export async function updateAdminPost(
  db: Database,
  input: AdminUpdatePostInput,
  userId?: string,
) {
  const [currentPost] = await db
    .select()
    .from(feedback)
    .where(eq(feedback.id, input.id))
    .limit(1);

  if (!currentPost) {
    return null;
  }

  const [updatedPost] = await db
    .update(feedback)
    .set({
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.boardId && { boardId: input.boardId }),
      ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
      ...(input.completedAt && { completedAt: new Date(input.completedAt) }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.tags && { tags: input.tags }),
      updatedAt: new Date(),
    })
    .where(eq(feedback.id, input.id))
    .returning();

  if (!updatedPost || !userId) {
    return updatedPost ?? null;
  }

  const activities: Array<{
    action: ActivityAction;
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }> = [];

  // Title change
  if (input.title !== undefined && input.title !== currentPost.title) {
    activities.push({
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
    activities.push({
      action: 'description_changed',
      field: 'description',
      oldValue: currentPost.description,
      newValue: input.description,
    });
  }

  // Status change
  if (input.status !== undefined && input.status !== currentPost.status) {
    activities.push({
      action: 'status_changed',
      field: 'status',
      oldValue: currentPost.status,
      newValue: input.status,
    });
  }

  // Priority change
  if (input.priority !== undefined && input.priority !== currentPost.priority) {
    activities.push({
      action: 'priority_changed',
      field: 'priority',
      oldValue: currentPost.priority,
      newValue: input.priority,
    });
  }

  // Board change
  if (input.boardId !== undefined && input.boardId !== currentPost.boardId) {
    activities.push({
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
      activities.push({
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
      activities.push({
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
        activities.push({
          action: 'unassigned',
          field: 'assigneeId',
          oldValue: currentPost.assigneeId,
          newValue: null,
        });
      } else {
        activities.push({
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
        activities.push({
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
        activities.push({
          action: 'tag_removed',
          field: 'tags',
          oldValue: tag,
          newValue: newTags,
        });
      }
    }
  }

  // Create activity logs for all changes
  await Promise.all(
    activities.map((activity) =>
      createActivityLog(db, {
        feedbackId: input.id,
        userId,
        action: activity.action,
        field: activity.field,
        oldValue: activity.oldValue,
        newValue: activity.newValue,
      }),
    ),
  );

  return updatedPost;
}

export async function deleteAdminPost(
  db: Database,
  id: string,
  userId?: string,
) {
  // Fetch current state before deleting
  const [currentPost] = await db
    .select()
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);

  const deletedPost =
    (await db.delete(feedback).where(eq(feedback.id, id)).returning())[0] ??
    null;

  // Log deletion activity
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

export async function getAdminAllPosts(db: Database) {
  return await db.select().from(feedback);
}

export type PublicCreatePostInput = {
  boardId: string;
  title: string;
  description: string;
};

export async function createPublicPost(
  db: Database,
  input: PublicCreatePostInput,
  authorId: string,
) {
  // Status pending and the no issue key to signify public post that is still to be reviewed
  const [newPost] = await db
    .insert(feedback)
    .values({
      boardId: input.boardId,
      authorId,
      title: input.title,
      description: input.description,
      priority: 'no-priority',
      status: 'pending',
    })
    .returning();

  return newPost;
}

export async function deletePublicPost(db: Database, feedbackId: string) {
  const [deletedPost] = await db
    .delete(feedback)
    .where(eq(feedback.id, feedbackId))
    .returning();
  return deletedPost ?? null;
}

export async function getAndUpdatePostSerialCount(
  db: Database,
  teamId: string,
  insertionCount?: number,
): Promise<number> {
  const nextSerial = insertionCount ?? 1;
  const result = await db
    .insert(teamSerials)
    .values({ teamId, nextSerial: nextSerial + 1 })
    .onConflictDoUpdate({
      target: teamSerials.teamId,
      set: { nextSerial: sql`${teamSerials.nextSerial} + ${nextSerial}` },
    })
    .returning();
  return result[0].nextSerial - nextSerial;
}

export async function findFeedbackByIssueKey(
  db: Database,
  issueKey: string,
): Promise<{ id: string } | null> {
  const [result] = await db
    .select({ id: feedback.id })
    .from(feedback)
    .where(eq(feedback.issueKey, issueKey.toLowerCase()))
    .limit(1);

  return result || null;
}

export async function updateFeedbackStatus(
  db: Database,
  feedbackId: string,
  status: StatusEnum,
): Promise<void> {
  await db
    .update(feedback)
    .set({ status, updatedAt: new Date() })
    .where(eq(feedback.id, feedbackId));
}

export async function promoteRequestedIssue(
  db: Database,
  id: string,
  teamId: string,
  userId?: string,
) {
  // Fetch current state before promoting
  const [currentPost] = await db
    .select()
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);

  if (!currentPost) {
    return null;
  }

  const teamDetails = await getTeamDetails(db, teamId);
  const teamName = teamDetails[0]?.name;

  const teamSerial = await getAndUpdatePostSerialCount(db, teamId);

  const issueKey = generateIssueKey(teamName, teamSerial);

  const promotedPost =
    (
      await db
        .update(feedback)
        .set({ status: 'to-do', issueKey, updatedAt: new Date() })
        .where(eq(feedback.id, id))
        .returning()
    )[0] ?? null;

  // Log promotion activities
  if (promotedPost && userId) {
    const activities = [];

    // Log status change if it changed
    if (currentPost.status !== 'to-do') {
      activities.push(
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
      activities.push(
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

    await Promise.all(activities);
  }

  return promotedPost;
}
