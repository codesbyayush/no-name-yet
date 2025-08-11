import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { AdminRouter } from "../../../server/src/orpc/admin";

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
