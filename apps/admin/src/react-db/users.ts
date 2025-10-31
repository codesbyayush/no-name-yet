import { queryCollectionOptions } from '@tanstack/query-db-collection';
import {
  createCollection,
  eq,
  ilike,
  lower,
  useLiveQuery,
} from '@tanstack/react-db';
import type { User as ServerUser } from 'server/types';
import type { OptionalExcept } from '@/types/utility';
import { adminClient } from '@/utils/admin-orpc';
import { queryClient } from '@/utils/orpc';

export type UserDoc = OptionalExcept<
  ServerUser,
  'id' | 'name' | 'email' | 'role'
> & {
  teamIds?: string[];
};

const usersCollection = createCollection<UserDoc>(
  queryCollectionOptions<UserDoc, string>({
    queryKey: ['users'],
    queryClient,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: async () => {
      const resp = await adminClient.organization.users.getOrganizationUsers({
        limit: 100,
        offset: 0,
      });
      return resp.users;
    },
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      // Simulate server latency for now
      await new Promise((r) => setTimeout(r, 400));
    },
    onUpdate: async ({ transaction }) => {
      // No server endpoint yet; keep local-only until available
      await new Promise((r) => setTimeout(r, 300));
    },
    onDelete: async ({ transaction }) => {
      // No server endpoint yet; keep local-only until available
      await new Promise((r) => setTimeout(r, 200));
    },
  }),
);

// Queries
export const useUsers = () =>
  useLiveQuery((q) => q.from({ user: usersCollection }));

export const useUserById = (id: string | undefined) =>
  useLiveQuery((q) =>
    q
      .from({ user: usersCollection })
      .where(({ user }) => eq(user.id, id))
      .limit(1),
  );

export const useUsersByRole = (role: string | undefined) =>
  useLiveQuery((q) =>
    q
      .from({ user: usersCollection })
      .where(({ user }) => (role ? eq(user.role, role) : true)),
  );

export const useUsersByTeam = (teamId: string | undefined) =>
  useLiveQuery((q) =>
    q.from({ user: usersCollection }).where(({ user }) => {
      if (!teamId) {
        return true;
      }
      const teams = (user.teamIds ?? []) as unknown as string[];
      return teams.includes(teamId);
    }),
  );

export const useSearchUsers = (query: string | undefined) => {
  const term = (query ?? '').trim().toLowerCase();
  return useLiveQuery(
    (q) =>
      q.from({ user: usersCollection }).where(({ user }) => {
        if (!term) {
          return true;
        }
        const name = lower(user.name);
        const email = lower(user.email);
        return ilike(name, `%${term}%`) || ilike(email, `%${term}%`);
      }),
    [term],
  );
};

export const useUsersCount = () => {
  const { data } = useUsers();
  return { data: data?.length } as const;
};

// Mutations (local-first for now)
export const useAddUser = () => ({
  mutate: (user: UserDoc) => usersCollection.insert(user),
});

export const useAddUsers = () => ({
  mutate: (users: UserDoc[]) => {
    for (const u of users) {
      usersCollection.insert(u);
    }
  },
});
export const useUpdateUser = () => ({
  mutate: (id: string, changes: Partial<UserDoc>) =>
    usersCollection.update(id, (draft) => Object.assign(draft, changes)),
});
export const useDeleteUser = () => ({
  mutate: (id: string) => usersCollection.delete(id),
});

export const users = usersCollection;
