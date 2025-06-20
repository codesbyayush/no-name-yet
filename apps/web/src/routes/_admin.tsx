import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { AuthProvider } from "@/contexts/auth-context";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthProvider requireAuth={true} adminOnly={false}>
      <OnboardingGuard requiresOnboarding={true}>
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
      </OnboardingGuard>
    </AuthProvider>
  );
}
