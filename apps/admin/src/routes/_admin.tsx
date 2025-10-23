import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Providers } from '@/contexts/providers';
import { SidebarRightProvider } from '@/contexts/sidebar-right';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();
    if (!session || session.user.isAnonymous) {
      throw redirect({
        to: '/auth',
        search: { redirect: location.pathname },
        replace: true,
      });
    }
    return { session };
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <Providers>
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
    </Providers>
  );
}
