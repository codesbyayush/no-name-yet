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
      <div className='flex min-h-screen w-full'>
        <AppSidebar className='w-64' />
        <SidebarInset className='max-w-full flex-1'>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
