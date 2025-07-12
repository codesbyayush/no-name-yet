// Node.js-only imports for local dev TLS (not for Workers)
// import { readFileSync } from "fs";
// import { resolve } from "path";
// import { readFileSync } from "fs";
// import { resolve } from "path"; // Not available in Workers
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext, createAdminContext } from "./orpc/context";
import { apiRouter } from "./orpc/index";
import { adminRouter } from "./orpc/admin";
import v1Router from "./rest";

const app = new Hono();

const authRouter = new Hono();

// NOTE: You may need to re-implement this route to use getAuth(c.env) if needed
// For now, we will leave it as a stub
// authRouter.all("*", async (c) => {
//   try {
//     const auth = getAuth(c.env);
//     return await auth.handler(c.req.raw);
//   } catch (error) {
//     return c.json(
//       {
//         error: "Auth failed",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       500,
//     );
//   }
// });

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin, c) => {
      return origin.endsWith(c.env.CORS_ORIGIN!)
        ? origin
        : "https://localhost:3002";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Tenant-ID",
      "X-Public-Key",
      "Cookie",
      "Set-Cookie",
      "X-Requested-With",
    ],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
    maxAge: 86400, // 24 hours
  }),
);
app.get("/docs", (c) => c.redirect("/api/docs"));

app.route("/api/auth", authRouter);
app.route("/api/v1", v1Router);

// oRPC Handler for regular API routes
const rpcHandler = new RPCHandler(apiRouter);
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c, env: c.env });
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });
  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

// oRPC Handler for admin routes
const adminRpcHandler = new RPCHandler(adminRouter);
app.use("/admin/*", async (c, next) => {
  const context = await createAdminContext({ context: c, env: c.env });
  const { matched, response } = await adminRpcHandler.handle(c.req.raw, {
    prefix: "/admin",
    context: context,
  });
  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

export default app;
