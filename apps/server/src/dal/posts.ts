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
  tags as tagsTable,
  team,
  teamSerials,
  user,
  votes,
} from '@/db/schema';
import { generateIssueKey } from '@/services/issue';
import { getTeamDetails } from './organization';

export type Database = ReturnType<typeof import('@/db').getDb>;

export type GetPostsFilters = {
  organizationId: string;
  boardId?: string;
  offset: number;
  take: number;
  sortBy?: 'newest' | 'oldest';
};

export type IssueStatus =
  | 'to-do'
  | 'in-progress'
  | 'technical-review'
  | 'completed'
  | 'backlog'
  | 'paused'
  | 'pending';

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
    eq(boards.organizationId, filters.organizationId),
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
  organizationId: string;
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

  // TODO: improve this n+1 query to 1 query
  const tagAugmented = await Promise.all(
    rows.slice(0, filters.take).map(async (post) => {
      const tags = await db
        .select({
          id: tagsTable.id,
          name: tagsTable.name,
          color: tagsTable.color,
        })
        .from(tagsTable)
        .innerJoin(feedbackTags, eq(tagsTable.id, feedbackTags.tagId))
        .where(eq(feedbackTags.feedbackId, post.id));
      return { ...post, tags } as const;
    }),
  );

  const hasMore = rows.length > filters.take;
  return { posts: tagAugmented, hasMore };
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
  status: IssueStatus;
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
      teamId,
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

  return newPost;
}

export type AdminUpdatePostInput = {
  id: string;
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  url?: string;
  userAgent?: string;
  browserInfo?: {
    platform?: string;
    language?: string;
    cookieEnabled?: boolean;
    onLine?: boolean;
    screenResolution?: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  assigneeId?: string | null;
};

export async function updateAdminPost(
  db: Database,
  input: AdminUpdatePostInput,
) {
  const [updatedPost] = await db
    .update(feedback)
    .set({
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.url && { url: input.url }),
      ...(input.userAgent && { userAgent: input.userAgent }),
      ...(input.browserInfo && { browserInfo: input.browserInfo }),
      ...(input.attachments && { attachments: input.attachments }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      updatedAt: new Date(),
    })
    .where(eq(feedback.id, input.id))
    .returning();

  return updatedPost ?? null;
}

export async function deleteAdminPost(db: Database, id: string) {
  return (
    (await db.delete(feedback).where(eq(feedback.id, id)).returning())[0] ??
    null
  );
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
  organizationId: string,
): Promise<{ id: string } | null> {
  const [result] = await db
    .select({ id: feedback.id })
    .from(feedback)
    .leftJoin(team, eq(team.id, feedback.teamId))
    .where(
      and(
        eq(feedback.issueKey, issueKey.toLowerCase()),
        eq(team.organizationId, organizationId),
      ),
    )
    .limit(1);

  return result || null;
}

export async function updateFeedbackStatus(
  db: Database,
  feedbackId: string,
  status: IssueStatus,
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
) {
  const teamDetails = await getTeamDetails(db, teamId);
  const teamName = teamDetails[0]?.name;

  const teamSerial = await getAndUpdatePostSerialCount(db, teamId);

  const issueKey = generateIssueKey(teamName, teamSerial);

  return (
    (
      await db
        .update(feedback)
        .set({ status: 'to-do', issueKey, updatedAt: new Date() })
        .where(eq(feedback.id, id))
        .returning()
    )[0] ?? null
  );
}
