import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { AuthProvider } from "@/contexts/auth-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthProvider requireAuth={true} adminOnly={false}>
      <OnboardingGuard requiresOnboarding={true}>
        <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </OnboardingGuard>
    </AuthProvider>
  );
}
