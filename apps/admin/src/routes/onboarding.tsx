import { createFileRoute, redirect } from '@tanstack/react-router';
import { GeneratedForm } from '@/components/admin/onboarding-form';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/onboarding')({
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
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-gradient-to-b from-card via-90% to-black py-8'>
      <GeneratedForm />
    </div>
  );
}
