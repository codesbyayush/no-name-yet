import { queryCollectionOptions } from '@tanstack/query-db-collection';
import {
  createCollection,
  eq,
  ilike,
  lower,
  useLiveQuery,
} from '@tanstack/react-db';
import { adminClient } from '@/utils/admin-orpc';
import { queryClient } from '@/utils/orpc';
import type { Board } from '../../../server/src/types';

type BoardDoc = Board;

const boardsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['boards'],
    queryClient,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: async () => await adminClient.organization.boardsRouter.getAll(),
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const m = transaction.mutations[0];
      const c = m.changes as Partial<BoardDoc>;
      await adminClient.organization.boardsRouter.create({
        name: String(c.name),
        emoji: String(c.symbol ?? ''),
        slug: String(c.slug),
        description: c.description ?? undefined,
        isPrivate: (c.isPrivate ?? false) as boolean,
        customFields: c.customFields ?? undefined,
      });
    },
    onUpdate: async ({ transaction }) => {
      const m = transaction.mutations[0];
      const c = m.changes as Partial<BoardDoc>;
      await adminClient.organization.boardsRouter.update({
        id: m.key as string,
        ...(c.name !== undefined ? { name: c.name } : {}),
        ...(c.slug !== undefined ? { slug: c.slug } : {}),
        ...(c.description && { description: c.description }),
        ...(c.isPrivate !== null && { isPrivate: c.isPrivate }),
        ...(c.customFields !== undefined
          ? { customFields: c.customFields }
          : {}),
      });
    },
    onDelete: async ({ transaction }) => {
      const m = transaction.mutations[0];
      await adminClient.organization.boardsRouter.delete({
        id: m.key as string,
      });
    },
  })
);

export const useBoards = () =>
  useLiveQuery((q) => q.from({ board: boardsCollection }));

export const useBoardById = (id: string | undefined) =>
  useLiveQuery((q) =>
    q
      .from({ board: boardsCollection })
      .where(({ board }) => (id ? eq(board.id, id) : false))
      .limit(1)
  );

export const useSearchBoards = (query: string | undefined) => {
  const term = (query ?? '').trim().toLowerCase();
  return useLiveQuery((q) =>
    q.from({ board: boardsCollection }).where(({ board }) => {
      if (!term) {
        return true;
      }
      const name = lower(board.name);
      const slug = lower(board.slug);
      return ilike(name, `%${term}%`) || ilike(slug, `%${term}%`);
    })
  );
};

export const useAddBoard = () => ({
  mutate: (board: BoardDoc) => boardsCollection.insert(board),
});
export const useUpdateBoard = () => ({
  mutate: (id: string, changes: Partial<BoardDoc>) =>
    boardsCollection.update(id, (d) => Object.assign(d, changes)),
});
export const useDeleteBoard = () => ({
  mutate: (id: string) => boardsCollection.delete(id),
});

export const boards = boardsCollection;
