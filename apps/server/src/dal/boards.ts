import { and, asc, eq } from 'drizzle-orm';
import { boards } from '@/db/schema/boards';

type Database = ReturnType<typeof import('@/db').getDb>;

export async function getPublicBoards(db: Database, organizationId: string) {
  return await db
    .select({
      id: boards.id,
      name: boards.name,
      slug: boards.slug,
      description: boards.description,
    })
    .from(boards)
    .where(
      and(
        eq(boards.organizationId, organizationId),
        eq(boards.isPrivate, false)
      )
    )
    .orderBy(asc(boards.createdAt));
}

export async function getAllBoards(db: Database, organizationId: string) {
  return await db
    .select()
    .from(boards)
    .where(eq(boards.organizationId, organizationId));
}

export type CreateBoardInput = {
  name: string;
  slug: string;
  description?: string;
  isPrivate?: boolean;
};

export async function createBoard(
  db: Database,
  organizationId: string,
  input: CreateBoardInput
) {
  const boardId = crypto.randomUUID();
  const [newBoard] = await db
    .insert(boards)
    .values({
      id: boardId,
      organizationId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      isPrivate: input.isPrivate ?? false,
    })
    .returning();
  return newBoard ?? null;
}

export type UpdateBoardInput = {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  isPrivate?: boolean;
};

export async function updateBoard(db: Database, input: UpdateBoardInput) {
  const [updatedBoard] = await db
    .update(boards)
    .set({
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
      updatedAt: new Date(),
    })
    .where(eq(boards.id, input.id))
    .returning();
  return updatedBoard ?? null;
}

export async function deleteBoard(db: Database, id: string) {
  const [deletedBoard] = await db
    .delete(boards)
    .where(eq(boards.id, id))
    .returning();
  return deletedBoard ?? null;
}
