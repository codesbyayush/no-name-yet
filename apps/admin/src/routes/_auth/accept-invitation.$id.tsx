import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';

export const Route = createFileRoute('/_auth/accept-invitation/$id')({
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { id: invitationId } = Route.useParams();
  const navigate = useNavigate();
  const {
    session,
    isAuthenticated,
    isPending: isSessionPending,
    auth,
    refetchSession,
    setSessionCache,
  } = useAuth();

  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptStatus, setAcceptStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch invitation details
  const {
    data: invitation,
    isPending: isInvitationPending,
    error: invitationError,
  } = useQuery({
    queryKey: ['invitation', invitationId],
    queryFn: async () => {
      const response = await auth.organization.getInvitation({
        query: { id: invitationId },
      });
      if (response.error) {
        throw new Error(response.error.message || 'Invitation not found');
      }
      return response.data;
    },
    retry: false,
    enabled: !isSessionPending && isAuthenticated,
  });

  // Check if user is already in an organization (different from the invited one)
  const userCurrentOrgId = session?.session?.activeOrganizationId;
  const isAlreadyInDifferentOrg =
    isAuthenticated &&
    userCurrentOrgId &&
    invitation &&
    userCurrentOrgId !== invitation.organizationId;

  async function handleAcceptInvitation() {
    setIsAccepting(true);
    setErrorMessage('');

    try {
      const result = await auth.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to accept invitation');
      }

      // Set the new organization as active
      if (invitation?.organizationId) {
        await auth.organization.setActive({
          organizationId: invitation.organizationId,
        });
      }

      setAcceptStatus('success');
      toast.success('Successfully joined the organization!');

      // Clear session cache and refetch to get new organization
      setSessionCache(null);
      await refetchSession();

      // Hard redirect to ensure fresh state
      setTimeout(() => {
        window.location.href = '/boards';
      }, 1500);
    } catch (error) {
      setAcceptStatus('error');
      const message =
        error instanceof Error ? error.message : 'Failed to accept invitation';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsAccepting(false);
    }
  }

  function handleSignInFirst() {
    // Redirect to auth with the invitation ID so we can accept after sign in
    navigate({
      to: '/auth',
      search: { invitationId },
      replace: true,
    });
  }

  // Not authenticated - prompt to sign in first
  if (!isAuthenticated && !isSessionPending) {
    return (
      <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black'>
        <Card className='w-full max-w-md border-border/50 bg-card/50 backdrop-blur'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
              <UserPlus className='h-8 w-8 text-primary' />
            </div>
            <CardTitle>You've been Invited!</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-center text-sm text-muted-foreground'>
              Please sign in or create an account to accept this invitation.
            </p>
            <Button className='w-full' onClick={handleSignInFirst}>
              Sign In to Accept
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isSessionPending || isInvitationPending) {
    return (
      <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black'>
        <Card className='w-full max-w-md border-border/50 bg-card/50 backdrop-blur'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='mt-4 text-muted-foreground'>Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invitation error or not found
  if (invitationError || !invitation) {
    return (
      <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black'>
        <Card className='w-full max-w-md border-destructive/50 bg-card/50 backdrop-blur'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
              <XCircle className='h-8 w-8 text-destructive' />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been
              used.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center'>
            <Button variant='outline' onClick={() => navigate({ to: '/auth' })}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (acceptStatus === 'success') {
    return (
      <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black'>
        <Card className='w-full max-w-md border-green-500/50 bg-card/50 backdrop-blur'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10'>
              <CheckCircle2 className='h-8 w-8 text-green-500' />
            </div>
            <CardTitle>Welcome to {invitation.organizationName}!</CardTitle>
            <CardDescription>
              You have successfully joined the organization. Redirecting you to
              the dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is already in a different organization - cannot join
  if (isAlreadyInDifferentOrg) {
    return (
      <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black'>
        <Card className='w-full max-w-md border-amber-500/50 bg-card/50 backdrop-blur'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10'>
              <AlertTriangle className='h-8 w-8 text-amber-500' />
            </div>
            <CardTitle>Already Part of an Organization</CardTitle>
            <CardDescription className='space-y-2'>
              <span className='block'>
                You're currently a member of another organization. Users can
                only belong to one organization at a time.
              </span>
              <span className='block text-muted-foreground'>
                To join{' '}
                <span className='font-semibold text-foreground'>
                  {invitation.organizationName}
                </span>
                , you would need to leave your current organization first.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-lg bg-muted/50 p-4'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Invited to</span>
                  <span className='font-medium'>
                    {invitation.organizationName}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Role offered</span>
                  <span className='font-medium capitalize'>
                    {invitation.role}
                  </span>
                </div>
              </div>
            </div>
            <p className='text-center text-xs text-muted-foreground'>
              If you believe this is an error, please contact the organization
              administrator.
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => navigate({ to: '/boards', replace: true })}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - show accept invitation UI
  return (
    <div className='mx-auto flex min-h-screen w-full items-center justify-center bg-linear-to-b from-card via-90% to-black'>
      <Card className='w-full max-w-md border-border/50 bg-card/50 backdrop-blur'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <UserPlus className='h-8 w-8 text-primary' />
          </div>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join{' '}
            <span className='font-semibold text-foreground'>
              {invitation.organizationName}
            </span>{' '}
            as a{' '}
            <span className='font-semibold text-foreground'>
              {invitation.role}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {acceptStatus === 'error' && errorMessage && (
            <div className='rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive'>
              {errorMessage}
            </div>
          )}

          <div className='rounded-lg bg-muted/50 p-4'>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Organization</span>
                <span className='font-medium'>
                  {invitation.organizationName}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Role</span>
                <span className='font-medium capitalize'>
                  {invitation.role}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Invited by</span>
                <span className='font-medium'>{invitation.inviterEmail}</span>
              </div>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => navigate({ to: '/auth' })}
              disabled={isAccepting}
            >
              Decline
            </Button>
            <Button
              className='flex-1'
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
