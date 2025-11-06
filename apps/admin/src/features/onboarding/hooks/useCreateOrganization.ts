import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts';
import { queryClient } from '@/utils/orpc';

interface CreateOrganizationParams {
  name: string;
  slug: string;
  userId: string | undefined;
}

export function useCreateOrganization() {
  const { auth, refetchSession } = useAuth();

  return useMutation({
    mutationFn: async ({ name, slug, userId }: CreateOrganizationParams) => {
      if (!auth) {
        throw new Error('Auth client is not available');
      }

      const org = await auth.organization.create({
        name,
        slug,
        userId,
      });

      if (!org.data) {
        throw new Error('Failed to create organization');
      }

      await auth.organization.setActive({
        organizationSlug: org.data.slug,
        organizationId: org.data.id,
      });

      return org.data;
    },
    onSuccess: async () => {
      await refetchSession();
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}
