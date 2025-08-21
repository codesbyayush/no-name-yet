import { githubAdminRouter } from "./github";
import { organizationRouter } from "./organization";
import { adminO } from "./procedures";
import { changelogAdminRouter } from "./tables";

// Admin router that uses AdminContext
export const adminRouter = adminO.router({
	organization: organizationRouter,
	changelog: changelogAdminRouter,
	github: githubAdminRouter,
});

export type AdminRouter = typeof adminRouter;
