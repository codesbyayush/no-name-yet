import type { ReactNode } from 'react';

export type WithAuthOptions = {
  requireOrganization?: boolean;
  loadingFallback?: ReactNode;
  redirectTo?: string;
  onboardingPath?: string;
  postOnboardingRedirect?: string;
};

export type GuardResolution =
  | { status: 'loading' }
  | { status: 'redirect'; to: string; search: Record<string, unknown> }
  | { status: 'render' };

export type GuardResolutionParams = {
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
