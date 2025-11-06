import { createFileRoute } from '@tanstack/react-router';
import { withAuthGuard } from '@/features/auth';
import { OnboardingForm } from '@/features/onboarding';

const GuardedOnboardingPage = withAuthGuard(OnboardingPage, {
  requireOrganization: false,
  postOnboardingRedirect: '/boards',
});

export const Route = createFileRoute('/onboarding/')({
  component: GuardedOnboardingPage,
});

function OnboardingPage() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-linear-to-b from-card via-90% to-black py-8'>
      <OnboardingForm />
    </div>
  );
}
