import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { createContext, useContext } from 'react';
import {
  authClient,
  type Session,
  type User,
  useSession,
} from '@/lib/auth-client';

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
  refetchSession: () => void;
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
  const { data: session, isPending, error, refetch } = useSession();

  // Extract user from session
  const user = session?.user || null;
  const isAuthenticated = !!session && !!user;

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      navigate({ to: '/auth', replace: true });
    } catch (error) {}
  };

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Context value
  const value: AuthContextType = {
    session,
    user,
    isLoading: isPending,
    isAuthenticated,
    signOut: handleSignOut,
    refetchSession: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
