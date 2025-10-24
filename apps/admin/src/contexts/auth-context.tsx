import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { authClient, type Session, type User } from '@/lib/auth-client';

const SESSION_QUERY_KEY = ['session'] as const;

type AuthClientInstance = typeof authClient;
type SignOutFn = AuthClientInstance['signOut'];
type SignOutReturn = Awaited<ReturnType<SignOutFn>>;

interface SignInOptions {
  callbackURL?: string;
  newUserCallbackURL?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  hasActiveOrganization: boolean;
  isPending: boolean;
  auth: AuthClientInstance;
  signIn: (provider: string, options?: SignInOptions) => Promise<void>;
  signOut: () => Promise<SignOutReturn>;
  refetchSession: () => Promise<Session | null>;

  // Sync utilities
  setSessionCache: (session: Session | null) => void;
  error: Error | null;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const fetchSession = useCallback(async () => {
    const { data } = await authClient.getSession();
    return data ?? null;
  }, []);

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
  }, [fetchSession, queryClient]);

  const handleSignIn = useCallback(
    async (provider: string, options?: SignInOptions) => {
      const getRedirectUrl = () => {
        if (options?.callbackURL) {
          return options.callbackURL;
        }

        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get('redirect');
        if (redirectParam) {
          return redirectParam.startsWith('http')
            ? redirectParam
            : `${window.location.origin}/${redirectParam}`;
        }

        return `${window.location.origin}/boards`;
      };

      const redirectUrl = getRedirectUrl();
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
    [location.search, queryClient]
  );

  const handleSignOut = useCallback(async () => {
    const result = await authClient.signOut();
    setSessionCache(null);
    await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    navigate({ to: '/auth', replace: true });
    return result as SignOutReturn;
  }, [navigate, queryClient, setSessionCache]);

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
      refetchSession,
      setSessionCache,
      error,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
