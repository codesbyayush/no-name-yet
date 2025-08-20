import { Hono } from "hono";
import githubSetupRouter from "./github-setup";
import publicApiRouter from "./public";

const v1Router = new Hono();

v1Router.route("/public", publicApiRouter);
v1Router.route("/github", githubSetupRouter);

v1Router.post("/post", async (c) => {
	const body = await c.req.json();
	return c.json({ message: "POST request received", body });
});

v1Router.get("/get", async (c) => {
	return c.json({ message: "GET request received" });
});

export default v1Router;
