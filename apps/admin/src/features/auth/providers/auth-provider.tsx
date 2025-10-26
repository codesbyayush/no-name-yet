import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { createContext, useCallback, useMemo } from 'react';
import { SESSION_QUERY_KEY } from '@/features/auth/constants';
import type {
  AuthContextType,
  SignInOptions,
  SignOutReturn,
} from '@/features/auth/types';
import { authClient, type Session } from '@/features/auth/utils/auth-client';
import { getRedirectUrl } from '@/features/auth/utils/redirect';
import { fetchSession } from '@/features/auth/utils/session';

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    data: session,
    isPending,
    error,
  } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 30_000,
  });

  // Derived state
  const user = session?.user || null;
  const isAuthenticated = Boolean(session && user && !user.isAnonymous);
  const activeOrganizationId = session?.session?.activeOrganizationId ?? null;
  const hasActiveOrganization = Boolean(activeOrganizationId);

  const setSessionCache = useCallback(
    (nextSession: Session | null) => {
      queryClient.setQueryData<Session | null>(SESSION_QUERY_KEY, nextSession);
    },
    [queryClient]
  );

  const refetchSession = useCallback(async (): Promise<Session | null> => {
    const next = await queryClient.fetchQuery<Session | null>({
      queryKey: SESSION_QUERY_KEY,
      queryFn: fetchSession,
    });
    return next ?? null;
  }, [queryClient]);

  const handleSignIn = useCallback(
    async (provider: string, options?: SignInOptions) => {
      const redirectUrl = getRedirectUrl(
        location.searchStr,
        options?.callbackURL
      );
      const newUserCallbackURL =
        options?.newUserCallbackURL || `${window.location.origin}/onboarding`;

      await authClient.signIn.social(
        {
          provider,
          callbackURL: redirectUrl,
          newUserCallbackURL,
        },
        {
          onResponse: () => {
            queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
          },
        }
      );
    },
    [location.searchStr, queryClient]
  );

  const handleSignOut = useCallback(async () => {
    const result = await authClient.signOut();
    setSessionCache(null);
    await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    navigate({ to: '/auth', replace: true });
    return result as SignOutReturn;
  }, [navigate, queryClient, setSessionCache]);

  const handleActiveTeamChange = useCallback(
    async (teamId: string) => {
      await authClient.organization.setActiveTeam({
        teamId,
      });
      setSessionCache(null);
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
    [queryClient, setSessionCache]
  );

  const value: AuthContextType = useMemo(
    () => ({
      session: session ?? null,
      user,
      isAuthenticated,
      hasActiveOrganization,
      isPending,
      auth: authClient,
      signIn: handleSignIn,
      signOut: handleSignOut,
      handleActiveTeamChange,
      refetchSession,
      setSessionCache,
      error,
    }),
    [
      session,
      user,
      isAuthenticated,
      hasActiveOrganization,
      isPending,
      handleSignIn,
      handleSignOut,
      handleActiveTeamChange,
      refetchSession,
      setSessionCache,
      error,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
