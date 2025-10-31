import type { GuardResolution, GuardResolutionParams } from '../types';

export function buildRedirectTarget(
  pathname: string,
  searchStr: string,
  hash: string,
) {
  const suffix = `${searchStr}${hash}`;
  return suffix ? `${pathname}${suffix}` : pathname;
}

export function resolveGuardResolution({
  isPending,
  isAuthenticated,
  hasError,
  requireOrganization,
  hasActiveOrganization,
  onAuthRoute,
  onOnboardingRoute,
  redirectSearch,
  redirectTo,
  onboardingPath,
  postOnboardingRedirect,
}: GuardResolutionParams): GuardResolution {
  if (isPending) {
    return { status: 'loading' };
  }

  if (!isAuthenticated || hasError) {
    if (onAuthRoute) {
      return { status: 'loading' };
    }

    return { status: 'redirect', to: redirectTo, search: redirectSearch };
  }

  if (requireOrganization && !hasActiveOrganization) {
    if (onOnboardingRoute) {
      return { status: 'loading' };
    }

    return { status: 'redirect', to: onboardingPath, search: redirectSearch };
  }

  if (!requireOrganization && hasActiveOrganization && onOnboardingRoute) {
    return {
      status: 'redirect',
      to: postOnboardingRedirect,
      search: {} as Record<string, unknown>,
    };
  }

  return { status: 'render' };
}
