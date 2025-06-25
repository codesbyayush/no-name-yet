import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { useSession } from "@/lib/auth-client";

export interface OnboardingStatus {
  step: 1 | 2 | "complete";
  needsOrganization: boolean;
  needsBoards: boolean;
  isComplete: boolean;
  boardCount: number;
}

export function useOnboardingStatus(): {
  data: OnboardingStatus | undefined;
  isLoading: boolean;
  error: any;
} {
  const { data: session, isPending: sessionLoading } = useSession();

  const {
    data: boardsData,
    isLoading: boardsLoading,
    error,
  } = useQuery({
    queryKey: ["user-boards"],
    queryFn: () => client.getUserBoards(),
    enabled: !!session?.user?.id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = sessionLoading || boardsLoading;

  if (isLoading || !session) {
    return { data: undefined, isLoading, error };
  }

  // We'll determine organization status from the boards data
  // If user has boards, they must have an organization
  // If no boards and no org, they need organization setup
  const boardCount = boardsData?.count || 0;
  const hasBoards = boardCount > 0;

  // We'll determine if user has organization by checking if they can get boards
  // This is a bit indirect, but works until we extend the session
  const hasOrganization = boardsData !== undefined && !error;

  const onboardingStatus: OnboardingStatus = {
    step: !hasOrganization ? 1 : !hasBoards ? 2 : "complete",
    needsOrganization: !hasOrganization,
    needsBoards: hasOrganization && !hasBoards,
    isComplete: hasOrganization && hasBoards,
    boardCount,
  };

  return { data: onboardingStatus, isLoading: false, error };
}

export function useSubdomainContext() {
  const getSubdomainInfo = () => {
    const host = window.location.host;
    const hostParts = host.split(".");

    // Check if we're on a subdomain (not localhost, not app)
    const isSubdomain =
      hostParts.length > 1 &&
      hostParts[0] !== "localhost" &&
      hostParts[0] !== "app";

    const subdomain = isSubdomain ? hostParts[0] : null;
    const isMainApp = hostParts[0] === "app" || host.includes("localhost");

    return {
      subdomain,
      isSubdomain,
      isMainApp,
      host,
    };
  };

  return getSubdomainInfo();
}

export function shouldRedirectToOnboarding(
  onboardingStatus: OnboardingStatus | undefined,
  subdomainContext: ReturnType<typeof useSubdomainContext>,
): { shouldRedirect: boolean; reason: string; step?: number } {
  if (!onboardingStatus) {
    return { shouldRedirect: false, reason: "Loading..." };
  }

  const { isMainApp } = subdomainContext;

  // Only redirect if we're on the main app (app.domain.com)
  if (!isMainApp) {
    return { shouldRedirect: false, reason: "Not on main app domain" };
  }

  // If user needs organization
  if (onboardingStatus.needsOrganization) {
    return {
      shouldRedirect: true,
      reason: "User needs organization setup",
      step: 1,
    };
  }

  // If user has organization but no boards
  if (onboardingStatus.needsBoards) {
    return {
      shouldRedirect: true,
      reason: "User has organization but needs to create boards",
      step: 2,
    };
  }

  return { shouldRedirect: false, reason: "Onboarding complete" };
}
