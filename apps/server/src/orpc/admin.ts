import { adminO } from "./procedures";
import { organizationRouter } from "./organization";

// Admin router that uses AdminContext
export const adminRouter = adminO.router({
  organization: organizationRouter,
});

export type AdminRouter = typeof adminRouter; 