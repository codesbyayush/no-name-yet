import { createFileRoute } from '@tanstack/react-router';
import { GeneratedForm } from '@/components/admin/onboarding-form';
import { withAuthGuard } from '@/components/auth/auth-guard';

const GuardedOnboardingPage = withAuthGuard(OnboardingPage, {
  requireOrganization: false,
  postOnboardingRedirect: '/boards',
});

export const Route = createFileRoute('/onboarding/')({
  component: GuardedOnboardingPage,
});

function OnboardingPage() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-gradient-to-b from-card via-90% to-black py-8'>
      <GeneratedForm />
    </div>
  );
}
