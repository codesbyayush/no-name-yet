interface OrganizationSlugAvailableProps {
  auth:
    | typeof import('@/features/auth/utils/auth-client').authClient
    | undefined;
  slug: string;
}

export async function isOrganizationSlugAvailable({
  auth,
  slug,
}: OrganizationSlugAvailableProps) {
  if (!slug || !auth) {
    return false;
  }
  try {
    const response = await auth.organization.checkSlug({ slug });
    return Boolean(response?.data?.status);
  } catch (_error) {
    return false;
  }
}
