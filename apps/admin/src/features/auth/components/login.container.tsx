import { useAuth } from '@/features/auth';
import SignIn from '@/features/auth/components/login-form';

interface LoginContainerProps {
  invitationId?: string;
}

export default function LoginContainer({ invitationId }: LoginContainerProps) {
  const { signIn } = useAuth();

  async function handleSignIn(provider: string) {
    // If there's an invitation, redirect to accept it after sign in
    const newUserCallbackURL = invitationId
      ? `${window.location.origin}/accept-invitation/${invitationId}`
      : undefined;

    await signIn(provider, { newUserCallbackURL });
  }

  return <SignIn onSignIn={handleSignIn} />;
}
