import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';
import { withAuthGuard } from '@/features/auth';
import { AppSidebar } from '@/shared/layout/app-sidebar';

const GuardedAdminLayout = withAuthGuard(AdminLayout);

export const Route = createFileRoute('/_admin')({
  component: GuardedAdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
