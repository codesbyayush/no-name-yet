import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import LoginContainer from '@/features/auth/components/login.container';
import { authClient } from '@/lib/auth-client';

const authSearchSchema = z.object({
  invitationId: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/_auth/auth')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ search }) => {
    const { data: session } = await authClient.getSession();

    // If user is authenticated and there's an invitation to accept, redirect there
    if (session && !session.user.isAnonymous && search.invitationId) {
      throw redirect({
        to: '/_auth/accept-invitation/$id',
        params: { id: search.invitationId },
        replace: true,
      });
    }

    // If user is authenticated with no pending invitation, go to boards
    if (session && !session.user.isAnonymous) {
      throw redirect({
        to: '/boards',
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invitationId } = Route.useSearch();

  return (
    <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black py-8'>
      <div className='mx-auto flex w-full max-w-2xs flex-col items-center justify-center'>
        <p className='relative top-2 rounded-full bg-primary-foreground/50 px-3.5 py-2 font-bold text-4xl'>
          A
        </p>
        {invitationId && (
          <p className='mt-4 text-center text-sm text-muted-foreground'>
            Sign in to accept your invitation
          </p>
        )}
        <LoginContainer invitationId={invitationId} />
      </div>
    </div>
  );
}
