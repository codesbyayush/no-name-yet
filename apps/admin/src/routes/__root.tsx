import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import '@workspace/ui/globals.css';
import '../index.css';
import { Providers } from '@/contexts';

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: 'OmniFeedback Admin',
      },
      {
        name: 'description',
        content:
          'OmniFeedback Admin is a bug/feature tracking tool admin dashboard.',
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
