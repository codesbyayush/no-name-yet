import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarRightProvider } from '@/contexts/sidebar-right';
import { withAuthGuard } from '@/features/auth';

const GuardedAdminLayout = withAuthGuard(AdminLayout);

export const Route = createFileRoute('/_admin')({
  component: GuardedAdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '300px',
          '--header-height': 'calc(var(--spacing) * 12)',
          maxWidth: '100%',
          overflow: 'hidden',
        } as React.CSSProperties
      }
    >
      <SidebarRightProvider>
        {/* <OmniFeedbackWidget /> */}
        <AppSidebar />
        <SidebarInset className='!mt-0 !mx-0 min-h-max'>
          <Outlet />
        </SidebarInset>
      </SidebarRightProvider>
    </SidebarProvider>
  );
}
