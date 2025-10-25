import { authClient, type Session } from '@/features/auth/utils/auth-client';

export async function fetchSession(): Promise<Session | null> {
  const { data } = await authClient.getSession();
  return data ?? null;
}
