import { useAuth } from '@/features/auth';
import SignIn from '@/features/auth/components/login-form';

export default function LoginContainer() {
  const { signIn } = useAuth();

  async function handleSignIn(provider: string) {
    await signIn(provider);
  }

  return <SignIn onSignIn={handleSignIn} />;
}
