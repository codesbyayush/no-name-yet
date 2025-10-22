import {
  aliasedTable,
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  inArray,
  type SQL,
  sql,
} from 'drizzle-orm';
import {
  boards,
  comments,
  feedback,
  feedbackTags,
  tags as tagsTable,
  user,
  votes,
} from '@/db/schema';

export type Database = ReturnType<typeof import('@/db').getDb>;

export type GetPostsFilters = {
  organizationId: string;
  boardId?: string;
  offset: number;
  take: number;
  sortBy?: 'newest' | 'oldest';
};

export async function getPostsWithAggregates(
  db: Database,
  filters: GetPostsFilters,
  userId?: string
) {
  const orderBy: SQL<unknown> = ((): SQL<unknown> => {
    switch (filters.sortBy) {
      case 'oldest':
        return asc(feedback.createdAt);
      default:
        return desc(feedback.createdAt);
    }
  })();

  const whereFilters = [
    eq(boards.organizationId, filters.organizationId),
  ] as SQL<unknown>[];
  if (filters.boardId) {
    whereFilters.push(eq(boards.id, filters.boardId));
  }

  const rows = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      content: feedback.description,
      createdAt: feedback.createdAt,
      status: feedback.status,
      board: {
        id: boards.id,
        name: boards.name,
        slug: boards.slug,
      },
      author: {
        name: user.name,
        image: user.image,
      },
      hasVoted: sql<boolean>`(select exists(select 1 from ${votes} where ${votes.feedbackId} = ${feedback.id} and ${votes.userId} = ${userId}))`,
      commentCount: sql<number>`(select count(*) from ${comments} where ${comments.feedbackId} = ${feedback.id})`,
      voteCount: sql<number>`(select count(*) from ${votes} where ${votes.feedbackId} = ${feedback.id})`,
    })
    .from(feedback)
    .leftJoin(boards, eq(feedback.boardId, boards.id))
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
  userId?: string
) {
  const rows = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      content: feedback.description,
      createdAt: feedback.createdAt,
      status: feedback.status,
      author: {
        name: user.name,
        image: user.image,
      },
      board: {
        id: boards.id,
        name: boards.name,
        slug: boards.slug,
      },
      hasVoted: sql<boolean>`(select exists(select 1 from ${votes} where ${votes.feedbackId} = ${feedback.id} and ${votes.userId} = ${userId}))`,
      commentCount: sql<number>`(select count(*) from ${comments} where ${comments.feedbackId} = ${feedback.id})`,
      voteCount: sql<number>`(select count(*) from ${votes} where ${votes.feedbackId} = ${feedback.id})`,
    })
    .from(feedback)
    .leftJoin(user, eq(feedback.authorId, user.id))
    .leftJoin(boards, eq(feedback.boardId, boards.id))
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
  userId?: string
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

  const whereFilters = [
    eq(boards.organizationId, filters.organizationId),
  ] as SQL<unknown>[];
  if (filters.boardId) {
    whereFilters.push(eq(boards.id, filters.boardId));
  }

  const creatorUser = aliasedTable(user, 'creator');
  const assigneeUser = aliasedTable(user, 'assignee');

  const rows = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      content: feedback.description,
      issueKey: feedback.issueKey,
      boardId: feedback.boardId,
      priority: feedback.priority,
      status: feedback.status,
      assigneeId: feedback.assigneeId,
      assigneeName: assigneeUser.name,
      assigneeEmail: assigneeUser.email,
      assigneeImage: assigneeUser.image,
      dueDate: feedback.dueDate,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      author: {
        id: creatorUser.id,
        name: creatorUser.name,
        email: creatorUser.email,
        image: creatorUser.image,
      },
      board: {
        id: boards.id,
        name: boards.name,
        slug: boards.slug,
      },
      hasVoted: userId
        ? exists(
            db
              .select()
              .from(votes)
              .where(
                and(eq(votes.feedbackId, feedback.id), eq(votes.userId, userId))
              )
          )
        : sql`false`,
    })
    .from(feedback)
    .leftJoin(creatorUser, eq(feedback.authorId, creatorUser.id))
    .leftJoin(assigneeUser, eq(feedback.assigneeId, assigneeUser.id))
    .leftJoin(boards, eq(feedback.boardId, boards.id))
    .where(and(...whereFilters))
    .orderBy(orderBy)
    .offset(filters.offset)
    .limit(filters.take + 1);

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
    })
  );

  const hasMore = rows.length > filters.take;
  return { posts: tagAugmented, hasMore };
}

export async function getAdminDetailedSinglePost(
  db: Database,
  feedbackId: string,
  userId?: string
) {
  const row = await db
    .select({
      id: feedback.id,
      title: feedback.title,
      content: feedback.description,
      boardId: feedback.boardId,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      board: { id: boards.id, name: boards.name, slug: boards.slug },
      hasVoted: userId
        ? exists(
            db
              .select()
              .from(votes)
              .where(
                and(eq(votes.feedbackId, feedback.id), eq(votes.userId, userId))
              )
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
  boardId: string;
  title: string;
  description: string;
  priority:
    | 'low'
    | 'medium'
    | 'high'
    | 'urgent'
    | 'no_priority'
    | 'no-priority';
  status:
    | 'to-do'
    | 'in-progress'
    | 'completed'
    | 'backlog'
    | 'technical-review'
    | 'paused';
  tags?: string[];
  issueKey?: string;
};

export async function createAdminPost(
  db: Database,
  input: AdminCreatePostInput,
  authorId: string
) {
  const normalizedPriority =
    input.priority === 'no_priority' ? 'no-priority' : input.priority;
  // Normalize issueKey to lowercase at write-time to avoid LOWER() in joins
  const normalizedIssueKey = input.issueKey ? input.issueKey.toLowerCase() : '';

  const [newPost] = await db
    .insert(feedback)
    .values({
      boardId: input.boardId,
      issueKey: normalizedIssueKey,
      authorId,
      title: input.title,
      description: input.description,
      priority: normalizedPriority,
      status: input.status,
    })
    .returning();

  if (input.tags && input.tags.length > 0) {
    const orgId = (
      await db
        .select({ organizationId: boards.organizationId })
        .from(boards)
        .where(eq(boards.id, newPost.boardId))
        .limit(1)
    )[0]?.organizationId as string | undefined;

    if (orgId) {
      const tagRows = await db
        .select({ id: tagsTable.id })
        .from(tagsTable)
        .where(
          and(
            eq(tagsTable.organizationId, orgId),
            inArray(tagsTable.name, input.tags)
          )
        );

      if (tagRows.length > 0) {
        await db.insert(feedbackTags).values(
          tagRows.map((t: { id: string }) => ({
            feedbackId: newPost.id,
            tagId: t.id,
          }))
        );
      }
    }
  }

  return newPost;
}

export type AdminUpdatePostInput = {
  id: string;
  title?: string;
  description?: string;
  status?:
    | 'to-do'
    | 'in-progress'
    | 'completed'
    | 'backlog'
    | 'technical-review'
    | 'paused';
  priority?:
    | 'low'
    | 'medium'
    | 'high'
    | 'urgent'
    | 'no_priority'
    | 'no-priority';
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
  input: AdminUpdatePostInput
) {
  const normalizedPriority =
    input.priority === 'no_priority' ? 'no-priority' : input.priority;

  const [updatedPost] = await db
    .update(feedback)
    .set({
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(normalizedPriority && { priority: normalizedPriority }),
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
  const [deleted] = await db
    .delete(feedback)
    .where(eq(feedback.id, id))
    .returning();
  return deleted ?? null;
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
  authorId: string
) {
  const postsCount = await db
    .select({ count: count() })
    .from(feedback)
    .where(eq(feedback.boardId, input.boardId));

  const issueKey = `OF-${(postsCount[0]?.count ?? 0) + 1}`.toLowerCase();

  const [newPost] = await db
    .insert(feedback)
    .values({
      boardId: input.boardId,
      authorId,
      title: input.title,
      description: input.description,
      issueKey,
      priority: 'no-priority',
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
