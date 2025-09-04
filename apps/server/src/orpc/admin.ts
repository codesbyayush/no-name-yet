import { organizationRouter } from './admin-only';
import { githubAdminRouter } from './admin-only/integrations/github';
import { adminO } from './procedures';

export const adminRouter = adminO.router({
  organization: organizationRouter,
  github: githubAdminRouter,
});

export type AdminRouter = typeof adminRouter;
