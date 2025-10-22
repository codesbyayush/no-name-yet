import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { authClient, type Session, type User } from '@/lib/auth-client';

// Define the auth context interface
interface AuthContextType {
  // Session data
  session: Session | null;
  user: User | null;

  // Loading states
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  signOut: () => Promise<void>;
  refetchSession: () => Promise<void>;

  // Sync utilities
  getSessionSync: () => Session | null;
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
  requireAuth?: boolean;
}

export function AuthProvider({
  children,
  requireAuth = true,
}: AuthProviderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: session,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => (await authClient.getSession()).data ?? null,
    staleTime: 30_000,
  });

  // Extract user from session
  const user = session?.user || null;
  const isAuthenticated = !!session && !!user;

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await queryClient.invalidateQueries({ queryKey: ['session'] });
    navigate({ to: '/auth', replace: true });
  }, [navigate, queryClient]);

  // Context value
  const value: AuthContextType = useMemo(
    () => ({
      session: session ?? null,
      user,
      isLoading: isPending,
      isAuthenticated,
      signOut: handleSignOut,
      refetchSession: async () => {
        await queryClient.invalidateQueries({ queryKey: ['session'] });
        await refetch();
      },
      getSessionSync: () => queryClient.getQueryData(['session']) ?? null,
    }),
    [
      session,
      user,
      isPending,
      isAuthenticated,
      queryClient,
      handleSignOut,
      refetch,
    ]
  );

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
