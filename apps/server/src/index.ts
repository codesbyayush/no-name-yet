import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { RPCHandler } from "@orpc/server/fetch";
import { auth } from "./lib/auth";
import { apiRouter } from "./orpc/index";
import { createContext } from "./orpc/context";
import { readFileSync } from "fs";
import { resolve } from "path";
import v1Router from "./rest";

const app = new Hono();

const authRouter = new Hono();

authRouter.all("*", async (c) => {
  try {
    return await auth.handler(c.req.raw);
  } catch (error) {
    return c.json(
      {
        error: "Auth failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin, _) => {
      // Support both HTTP and HTTPS for development
      return origin.endsWith(".localhost:3001") ||
        origin.endsWith(".localhost:3002") ||
        origin === "https://localhost:3001" ||
        origin === "https://localhost:3002"
        ? origin
        : "https://localhost:3002";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Tenant-ID",
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

// oRPC Handler
const rpcHandler = new RPCHandler(apiRouter);
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c });
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });
  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

const port = parseInt(process.env.PORT || "8080");

// TLS configuration for HTTPS in development
const tlsConfig =
  process.env.NODE_ENV === "development"
    ? {
        key: readFileSync(
          resolve(import.meta.dir, "../certs/localhost+2-key.pem"),
        ),
        cert: readFileSync(
          resolve(import.meta.dir, "../certs/localhost+2.pem"),
        ),
      }
    : undefined;

export default {
  port,
  fetch: app.fetch,
  tls: tlsConfig,
};
