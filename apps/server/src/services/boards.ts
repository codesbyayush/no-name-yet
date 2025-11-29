import {
  type CreateBoardInput,
  createBoard as dalCreateBoard,
  deleteBoard as dalDeleteBoard,
  updateBoard as dalUpdateBoard,
  getAllBoards,
  getPublicBoards,
  type UpdateBoardInput,
} from '@/dal/boards';
import type { Database } from '@/db';

/**
 * Get all boards for a team (admin)
 */
export async function getTeamBoards(db: Database, teamId: string) {
  return await getAllBoards(db, teamId);
}

/**
 * Get public boards for a team
 */
export async function getTeamPublicBoards(db: Database, teamId: string) {
  return await getPublicBoards(db, teamId);
}

/**
 * Create a new board
 */
export async function createBoard(
  db: Database,
  teamId: string,
  input: CreateBoardInput,
) {
  return await dalCreateBoard(db, teamId, input);
}

/**
 * Update a board
 */
export async function updateBoard(db: Database, input: UpdateBoardInput) {
  return await dalUpdateBoard(db, input);
}

/**
 * Delete a board
 */
export async function deleteBoard(db: Database, boardId: string) {
  return await dalDeleteBoard(db, boardId);
}
