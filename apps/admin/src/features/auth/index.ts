export { withAuthGuard } from './components/auth-guard';
export {
  DEFAULT_ONBOARDING_PATH,
  DEFAULT_POST_ONBOARDING_REDIRECT,
  DEFAULT_REDIRECT_PATH,
} from './constants';
export type {
  GuardResolution,
  GuardResolutionParams,
  WithAuthOptions,
} from './types';
export {
  buildRedirectTarget,
  resolveGuardResolution,
} from './utils/guard-resolution';
