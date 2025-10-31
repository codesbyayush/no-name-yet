import type { ReactNode } from 'react';
import type {
  authClient,
  Session,
  User,
} from '@/features/auth/utils/auth-client';

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

export interface SignInOptions {
  callbackURL?: string;
  newUserCallbackURL?: string;
}

export type SignOutReturn = Awaited<ReturnType<typeof authClient.signOut>>;

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  hasActiveOrganization: boolean;
  isPending: boolean;
  auth: typeof import('@/features/auth/utils/auth-client').authClient;
  signIn: (
    provider: string,
    options?: { callbackURL?: string; newUserCallbackURL?: string },
  ) => Promise<void>;
  signOut: () => Promise<unknown>;
  handleActiveTeamChange: (teamId: string) => Promise<void>;
  refetchSession: () => Promise<Session | null>;
  setSessionCache: (session: Session | null) => void;
  error: Error | null;
}
