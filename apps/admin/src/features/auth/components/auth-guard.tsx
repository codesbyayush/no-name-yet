import { Navigate, useLocation } from '@tanstack/react-router';
import type { ComponentType } from 'react';
import { useAuth } from '@/contexts';
import {
  DEFAULT_ONBOARDING_PATH,
  DEFAULT_POST_ONBOARDING_REDIRECT,
  DEFAULT_REDIRECT_PATH,
} from '@/features/auth/constants';
import type { WithAuthOptions } from '@/features/auth/types';
import {
  buildRedirectTarget,
  resolveGuardResolution,
} from '@/features/auth/utils/guard-resolution';
import Loader from '@/shared/navigation/loader';

export function withAuthGuard<P extends object>(
  Component: ComponentType<P>,
  {
    requireOrganization = true,
    loadingFallback,
    redirectTo = DEFAULT_REDIRECT_PATH,
    onboardingPath = DEFAULT_ONBOARDING_PATH,
    postOnboardingRedirect = DEFAULT_POST_ONBOARDING_REDIRECT,
  }: WithAuthOptions = {},
) {
  function WithAuthGuard(props: P) {
    const location = useLocation();
    const { isAuthenticated, hasActiveOrganization, isPending, error } =
      useAuth();

    const redirectTarget = buildRedirectTarget(
      location.pathname,
      location.searchStr ?? '',
      location.hash ?? '',
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
