import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import '../index.css';

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
      <div className='grid h-svh grid-rows-[auto_1fr]'>
        <Outlet />
      </div>
      <TanStackRouterDevtools position='bottom-right' />
    </>
  );
}
