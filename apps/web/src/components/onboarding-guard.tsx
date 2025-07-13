import {
  shouldRedirectToOnboarding,
  useOnboardingStatus,
  useSubdomainContext,
} from "@/hooks/use-onboarding-new";
import { useSession } from "@/lib/auth-client";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface OnboardingGuardProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean; // If true, only allow access if onboarding is complete
}

export function OnboardingGuard({
  children,
  requiresOnboarding = false,
}: OnboardingGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: onboardingStatus, isLoading: onboardingLoading } =
    useOnboardingStatus();
  const subdomainContext = useSubdomainContext();

  useEffect(() => {
    // Don't do anything while loading
    if (sessionLoading || onboardingLoading) return;

    // If user is not authenticated, don't redirect (let route handle auth)
    if (!session) return;

    // Check if we should redirect to onboarding
    const redirectDecision = shouldRedirectToOnboarding(
      onboardingStatus,
      subdomainContext,
    );

    // If we're on the onboarding page already, don't redirect
    if (location.pathname.includes("/onboarding")) {
      return;
    }

    // If this route requires onboarding to be complete and it's not
    if (requiresOnboarding && !onboardingStatus?.isComplete) {
      const step = redirectDecision.step || 1;
      navigate({
        to: "/onboarding",
        search: { step: step.toString() },
        replace: true,
      });
      return;
    }

    // If we should redirect to onboarding
    if (redirectDecision.shouldRedirect) {
      const step = redirectDecision.step || 1;
      navigate({
        to: "/onboarding",
        search: { step: step.toString() },
        replace: true,
      });
    }
  }, [
    session,
    onboardingStatus,
    subdomainContext,
    location.pathname,
    navigate,
    requiresOnboarding,
    sessionLoading,
    onboardingLoading,
  ]);

  // Show loading while we determine what to do
  if (sessionLoading || onboardingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
