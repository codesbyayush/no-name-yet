import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import '@workspace/ui/globals.css';
import '../index.css';
import { Providers } from '@/contexts';

export const Route = createRootRouteWithContext()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: 'OpenFeedback Admin Panel',
      },
      {
        name: 'description',
        content:
          'OpenFeedback Admin Panel is a bug/feature tracking tool admin dashboard.',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Providers>
        <Outlet />
      </Providers>
      <TanStackRouterDevtools position='bottom-right' />
    </>
  );
}
