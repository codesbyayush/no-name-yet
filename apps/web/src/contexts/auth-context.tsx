import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, authClient, type Session, type User } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

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
  
  // Additional user info
  isAdmin: boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export function AuthProvider({ 
  children, 
  requireAuth = true, 
  adminOnly = false 
}: AuthProviderProps) {
  const navigate = useNavigate();
  const { data: session, isPending, error, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Extract user from session
  const user = session?.user || null;
  const isAuthenticated = !!session && !!user;

  // Check if user is admin (you can customize this logic based on your user schema)
  const isAdmin = user?.role === "admin" || user?.email?.includes("admin") || false

  // Handle authentication requirements
  useEffect(() => {
    setIsLoading(isPending);

    if (!isPending) {
      // If auth is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        navigate({ 
          to: "/auth", 
          search: { redirect: window.location.pathname },
          replace: true 
        });
        return;
      }

      // If admin access is required but user is not admin
      if (adminOnly && isAuthenticated && !isAdmin) {
        navigate({ 
          to: "/", 
          replace: true 
        });
        return;
      }
    }
  }, [isPending, isAuthenticated, isAdmin, requireAuth, adminOnly, navigate]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      navigate({ to: "/auth", replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Show loading spinner while determining auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (adminOnly && (!isAuthenticated || !isAdmin)) {
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
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; adminOnly?: boolean } = {}
) {
  const { requireAuth = true, adminOnly = false } = options;

  const WrappedComponent = (props: P) => {
    return (
      <AuthProvider requireAuth={requireAuth} adminOnly={adminOnly}>
        <Component {...props} />
      </AuthProvider>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for admin-specific functionality
export const useAdminAuth = () => {
  const auth = useAuth();
  
  if (!auth.isAdmin) {
    throw new Error("useAdminAuth can only be used by admin users");
  }
  
  return {
    ...auth,
    // Add admin-specific methods here
    revokeUserSession: async (userId: string) => {
      // Implementation for revoking user sessions
      console.log("Revoking session for user:", userId);
    },
    listAllSessions: async () => {
      // Implementation for listing all sessions
      return authClient.listSessions();
    },
  };
};


