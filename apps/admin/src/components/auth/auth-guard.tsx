import { Navigate, useLocation } from '@tanstack/react-router';
import type { ComponentType, ReactNode } from 'react';
import Loader from '@/components/loader';
import { useSession } from '@/lib/auth-client';

type WithAuthOptions = {
  requireOrganization?: boolean;
  loadingFallback?: ReactNode;
  redirectTo?: string;
  onboardingPath?: string;
  postOnboardingRedirect?: string;
};

const DEFAULT_REDIRECT_PATH = '/auth';
const DEFAULT_ONBOARDING_PATH = '/onboarding';
const DEFAULT_POST_ONBOARDING_REDIRECT = '/boards';

function buildRedirectTarget(
  pathname: string,
  searchStr: string,
  hash: string
) {
  const suffix = `${searchStr}${hash}`;
  return suffix ? `${pathname}${suffix}` : pathname;
}

type GuardResolution =
  | { status: 'loading' }
  | { status: 'redirect'; to: string; search: Record<string, unknown> }
  | { status: 'render' };

type GuardResolutionParams = {
  isPending: boolean;
  isAuthenticated: boolean;
  hasError: boolean;
  requireOrganization: boolean;
  hasActiveOrganization: boolean;
  onAuthRoute: boolean;
  onOnboardingRoute: boolean;
  redirectSearch: Record<string, unknown>;
  redirectTo: string;
  onboardingPath: string;
  postOnboardingRedirect: string;
};

function resolveGuardResolution({
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

export function withAuthGuard<P extends object>(
  Component: ComponentType<P>,
  {
    requireOrganization = true,
    loadingFallback,
    redirectTo = DEFAULT_REDIRECT_PATH,
    onboardingPath = DEFAULT_ONBOARDING_PATH,
    postOnboardingRedirect = DEFAULT_POST_ONBOARDING_REDIRECT,
  }: WithAuthOptions = {}
) {
  function WithAuthGuard(props: P) {
    const location = useLocation();
    const { data: session, isPending, error } = useSession();

    const isAuthenticated = Boolean(session && !session.user.isAnonymous);
    const activeOrganizationId = session?.session?.activeOrganizationId ?? null;
    const hasActiveOrganization = Boolean(activeOrganizationId);
    const redirectTarget = buildRedirectTarget(
      location.pathname,
      location.searchStr ?? '',
      location.hash ?? ''
    );
    const redirectSearch: Record<string, unknown> = {
      redirect: redirectTarget,
    };
    const guardResolution = resolveGuardResolution({
      isPending,
      isAuthenticated,
      hasError: Boolean(error),
      requireOrganization,
      hasActiveOrganization,
      onAuthRoute: location.pathname.startsWith(redirectTo),
      onOnboardingRoute: location.pathname.startsWith(onboardingPath),
      redirectSearch,
      redirectTo,
      onboardingPath,
      postOnboardingRedirect,
    });

    if (guardResolution.status === 'loading') {
      return <>{loadingFallback ?? <Loader />}</>;
    }

    if (guardResolution.status === 'redirect') {
      return (
        <Navigate
          replace
          search={guardResolution.search}
          to={guardResolution.to}
        />
      );
    }

    return <Component {...props} />;
  }

  WithAuthGuard.displayName = `withAuthGuard(${Component.displayName ?? Component.name ?? 'Component'})`;

  return WithAuthGuard;
}
