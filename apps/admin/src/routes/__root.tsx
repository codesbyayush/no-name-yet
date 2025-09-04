import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useLocation,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Loader from '@/components/loader';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
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
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });
  const location = useLocation();
  const isLandingPage = location.pathname === '/landing';

  return (
    <>
      <HeadContent />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {isLandingPage ? (
          <div className="min-h-screen">
            <Outlet />
          </div>
        ) : (
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Outlet />
          </div>
        )}
        {isFetching && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center">
            <Loader />
          </div>
        )}
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
