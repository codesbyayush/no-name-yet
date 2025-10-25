import { createFileRoute, redirect } from '@tanstack/react-router';
import LoginContainer from '@/features/auth/components/login.container';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/auth/')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session && !session.user.isAnonymous) {
      throw redirect({
        to: '/boards',
        search: {
          tab: undefined,
          search: undefined,
          tag: undefined,
          status: undefined,
          order: undefined,
        },
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black py-8'>
      <div className='mx-auto flex w-full max-w-2xs flex-col items-center justify-center'>
        <p className='relative top-2 rounded-full bg-primary-foreground/50 px-3.5 py-2 font-bold text-4xl'>
          A
        </p>
        <LoginContainer />
      </div>
    </div>
  );
}
