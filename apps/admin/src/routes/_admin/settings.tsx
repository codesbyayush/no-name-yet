import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';

export const Route = createFileRoute('/_admin/settings')({
  beforeLoad: ({ location }) => {
    // Redirect bare /settings to default child route
    if (
      location.pathname === '/settings' ||
      location.pathname === '/settings/'
    ) {
      throw redirect({ to: '/settings/pricing', replace: true });
    }
  },
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className='h-svh overflow-hidden lg:p-2'>
      <div className='flex h-full flex-col items-center justify-start overflow-hidden bg-container lg:rounded-md lg:border'>
        <SiteHeader title='Settings' />

        <div className='min-h-[calc(100svh-80px)] w-full overflow-auto p-6 lg:min-h-[calc(100svh-96px)]'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
