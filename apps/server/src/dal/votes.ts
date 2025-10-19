import { and, count, eq, type SQL } from "drizzle-orm";
import { votes } from "@/db/schema";

export type Database = ReturnType<typeof import("@/db").getDb>;

export type CreateVoteInput = {
  feedbackId?: string;
  commentId?: string;
};

export async function createVote(
  db: Database,
  input: CreateVoteInput,
  userId: string
) {
  const [newVote] = await db
    .insert(votes)
    .values({
      userId,
      ...(input.feedbackId ? { feedbackId: input.feedbackId } : {}),
      ...(input.commentId ? { commentId: input.commentId } : {}),
    })
    .returning();
  return newVote ?? null;
}

export async function deleteVote(
  db: Database,
  input: CreateVoteInput,
  userId: string
) {
  const filters: SQL<unknown>[] = [eq(votes.userId, userId)];
  if (input.feedbackId) {
    filters.push(eq(votes.feedbackId, input.feedbackId));
  } else if (input.commentId) {
    filters.push(eq(votes.commentId, input.commentId));
  }
  const [deletedVote] = await db
    .delete(votes)
    .where(and(...filters))
    .returning();
  return deletedVote ?? null;
}

export async function countVotes(
  db: Database,
  input: { feedbackId?: string; commentId?: string }
) {
  const filters: SQL[] = [];
  if (input.feedbackId) {
    filters.push(eq(votes.feedbackId, input.feedbackId));
  } else if (input.commentId) {
    filters.push(eq(votes.commentId, input.commentId));
  }
  const totalCount = await db
    .select({ count: count() })
    .from(votes)
    .where(and(...filters));
  return totalCount[0]?.count || 0;
}
