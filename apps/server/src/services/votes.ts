import {
  type CreateVoteInput,
  countVotes,
  createVote as dalCreateVote,
  deleteVote as dalDeleteVote,
} from '@/dal/votes';
import type { Database } from '@/db';

/**
 * Create a vote (upvote)
 */
export async function addVote(
  db: Database,
  input: CreateVoteInput,
  userId: string,
) {
  return await dalCreateVote(db, input, userId);
}

/**
 * Remove a vote
 */
export async function removeVote(
  db: Database,
  input: CreateVoteInput,
  userId: string,
) {
  return await dalDeleteVote(db, input, userId);
}

/**
 * Get vote count for a feedback post or comment
 */
export async function getVoteCount(
  db: Database,
  input: { feedbackId?: string; commentId?: string },
) {
  return await countVotes(db, input);
}
