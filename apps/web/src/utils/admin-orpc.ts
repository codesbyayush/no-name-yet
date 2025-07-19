import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

// Temporary type definition for admin client
// TODO: Import proper types from server when available
type AdminRouter = {
  changelog: {
    createChangelog: any;
    updateChangelog: any;
    getChangelog: any;
    listChangelogs: any;
    publishChangelog: any;
    deleteChangelog: any;
  };
  organization: any;
};

export const adminLink = new RPCLink({
  url: `${import.meta.env.PUBLIC_BACKEND_SERVER_URL!}/admin`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const adminClient: RouterClient<AdminRouter> =
  createORPCClient(adminLink);
