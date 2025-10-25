export { withAuthGuard } from './components/auth-guard';
export {
  DEFAULT_ONBOARDING_PATH,
  DEFAULT_POST_ONBOARDING_REDIRECT,
  DEFAULT_REDIRECT_PATH,
} from './constants';
export { useAuth } from './hooks/useAuth';
export { AuthProvider } from './providers/auth-provider';
export type {
  GuardResolution,
  GuardResolutionParams,
  WithAuthOptions,
} from './types';
export type { Session, User } from './utils/auth-client';
export {
  authClient,
  signIn,
  signOut,
  signUp,
  useSession,
} from './utils/auth-client';
export {
  buildRedirectTarget,
  resolveGuardResolution,
} from './utils/guard-resolution';
