import { organizationRouter } from "./organization";
import { changelogAdminRouter } from "./changelog";
import { adminO } from "./procedures";

// Admin router that uses AdminContext
export const adminRouter = adminO.router({
	organization: organizationRouter,
	changelog: changelogAdminRouter,
});

export type AdminRouter = typeof adminRouter;
