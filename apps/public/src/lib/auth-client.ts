import {
  adminClient,
  anonymousClient,
  organizationClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: `${import.meta.env.PUBLIC_BACKEND_SERVER_URL!}/`,
  plugins: [adminClient(), organizationClient(), anonymousClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
