import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OnboardingGuard } from "@/components/onboarding-guard";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <OnboardingGuard requiresOnboarding={true}>
      <Outlet />
    </OnboardingGuard>
  );
}
