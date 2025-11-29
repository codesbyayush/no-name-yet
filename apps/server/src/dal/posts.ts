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
import type { Database } from '@/db';
import {
  boards,
  comments,
  feedback,
  type PriorityEnum,
  type StatusEnum,
  teamSerials,
  user,
  votes,
} from '@/db/schema';

export type GetPostsFilters = {
  teamId: string;
  boardId?: string;
  offset: number;
  take: number;
  sortBy?: 'newest' | 'oldest';
};

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

// Pure data access types
export type CreatePostData = {
  boardId?: string;
  issueKey?: string;
  authorId: string;
  title: string;
  description: string;
  priority: PriorityEnum;
  status: StatusEnum;
  tags?: string[];
  assigneeId?: string;
};

export type UpdatePostData = {
  title?: string;
  description?: string;
  status?: StatusEnum;
  priority?: PriorityEnum;
  boardId?: string;
  dueDate?: Date;
  completedAt?: Date;
  assigneeId?: string | null;
  tags?: string[];
  issueKey?: string;
};

/**
 * Find a post by ID (raw data)
 */
export async function findById(db: Database, id: string) {
  const [row] = await db
    .select()
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * Create a new post (pure data access)
 */
export async function create(db: Database, data: CreatePostData) {
  const [newPost] = await db
    .insert(feedback)
    .values({
      ...(data.boardId && { boardId: data.boardId }),
      ...(data.issueKey && { issueKey: data.issueKey }),
      authorId: data.authorId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
      ...(data.assigneeId && { assigneeId: data.assigneeId }),
    })
    .returning();

  return newPost ?? null;
}

/**
 * Update a post (pure data access)
 */
export async function update(db: Database, id: string, data: UpdatePostData) {
  const [updatedPost] = await db
    .update(feedback)
    .set({
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.boardId && { boardId: data.boardId }),
      ...(data.dueDate && { dueDate: data.dueDate }),
      ...(data.completedAt && { completedAt: data.completedAt }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.tags && { tags: data.tags }),
      ...(data.issueKey && { issueKey: data.issueKey }),
      updatedAt: new Date(),
    })
    .where(eq(feedback.id, id))
    .returning();

  return updatedPost ?? null;
}

/**
 * Delete a post (pure data access)
 */
export async function deleteById(db: Database, id: string) {
  const [deletedPost] = await db
    .delete(feedback)
    .where(eq(feedback.id, id))
    .returning();
  return deletedPost ?? null;
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

  return newPost ?? null;
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

  return result ?? null;
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
