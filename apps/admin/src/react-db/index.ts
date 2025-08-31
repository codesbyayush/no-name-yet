import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection, eq, useLiveQuery } from '@tanstack/react-db';
import { adminClient } from '@/utils/admin-orpc';
import { queryClient } from '@/utils/orpc';

export type StatusDoc = {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  color: string | null;
  order: number | null;
  isTerminal: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const statusesCollection = createCollection<StatusDoc>(
  queryCollectionOptions<StatusDoc, string>({
    queryKey: ['statuses'],
    queryClient,
    queryFn: async () => await adminClient.organization.status.getAll(),
    getKey: (item) => item.id,
  })
);

export const useStatuses = () =>
  useLiveQuery((q) => q.from({ status: statusesCollection }));

export const useStatusDetails = (statusId: string | undefined) =>
  useLiveQuery((q) =>
    q
      .from({ status: statusesCollection })
      .where(({ status }) => eq(status.id, statusId))
      .limit(1)
  );

export const useDeleteStatus = () => ({
  mutate: (id: string) => statusesCollection.delete(id),
});

export const useEditStatus = () => ({
  mutate: (status: any) =>
    statusesCollection.update(status.id, (draft) =>
      Object.assign(status, draft)
    ),
});

export const useStatusesCount = () => {
  const { data } = useStatuses();
  return { data: data?.length };
};
