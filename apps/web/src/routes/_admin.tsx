import { AppSidebar } from "@/components/app-sidebar";
import OmniFeedbackWidget from "@/components/feedback-widget";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/auth-context";
import { Outlet, createFileRoute } from "@tanstack/react-router";

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
					<OmniFeedbackWidget />
					<AppSidebar variant="inset" />
					<SidebarInset className="!mt-0 min-h-max">
						<Outlet />
					</SidebarInset>
				</SidebarProvider>
			</OnboardingGuard>
		</AuthProvider>
	);
}
