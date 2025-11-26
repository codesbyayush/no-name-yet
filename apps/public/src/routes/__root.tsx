import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useLocation,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from '@workspace/ui/components/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import type { orpc } from '../utils/orpc';
import '@workspace/ui/styles/globals.css';
import '../index.css';

export type RouterAppContext = {
  orpc: typeof orpc;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: 'OpenFeedback',
      },
      {
        name: 'description',
        content: 'OpenFeedback is a customer feedback collection platform',
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
  const location = useLocation();
  const isLandingPage = location.pathname === '/landing';

  return (
    <>
      <HeadContent />
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        {isLandingPage ? (
          <div className='min-h-screen'>
            <Outlet />
          </div>
        ) : (
          <div className='grid h-svh grid-rows-[auto_1fr]'>
            <Outlet />
          </div>
        )}
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position='bottom-left' />
    </>
  );
}
