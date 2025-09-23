import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { BrandLogoIcon } from '@/components/svg/logo';
import { authClient, useSession } from '@/lib/auth-client';
import UserMenu from '../components/user-menu';

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
});

function PublicLayout() {
  const location = useLocation();

  const { data: session, isPending } = useSession();

  useEffect(() => {
    (async () => {
      if (isPending) {
        return;
      }
      if (session === null) {
        await authClient.signIn.anonymous();
      }
    })();
  }, [session, isPending]);

  return (
    <div className="flex h-full min-h-screen flex-col items-center bg-background">
      {/* Navigation Header */}
      <nav className="flex w-[60rem] items-center justify-between gap-4 p-4">
        {/* Logo and Navigation Links */}
        <div className="flex items-center justify-center gap-4">
          {/* Logo */}
          <Link
            className="flex size-10 items-center gap-3 transition-opacity hover:opacity-80"
            to="/"
          >
            <BrandLogoIcon
              className="rounded-lg border border-muted/50 p-1 invert"
              size={40}
            />
          </Link>

          {/* Separator */}
          <div className="hidden h-6 w-px bg-gray-300 sm:block" />

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              className={`rounded-full px-3 py-2 font-medium text-xs transition-all sm:text-sm ${
                location.pathname.includes('/board')
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              search={{
                board: undefined,
              }}
              to="/board"
            >
              Feedback
            </Link>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
