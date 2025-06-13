import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { RPCHandler } from "@orpc/server/fetch";
import { auth } from "./lib/auth";
import { apiRouter } from "./orpc/index";
import { createContext } from "./orpc/context";

const app = new Hono();

const authRouter = new Hono();

authRouter.all("*", async (c) => {
  try {
    return await auth.handler(c.req.raw);
  } catch (error) {
    return c.json({ error: "Auth failed", details: error.message }, 500);
  }
});

app.use(logger());
app.use(
  "/*",
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:3002",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173", // Vite dev server
      "http://localhost:4173", // Vite preview
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002",
      "http://127.0.0.1:5173",
    ],
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

app.get("/", (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OmniFeedback API</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        .links { margin: 20px 0; }
        .links a { display: inline-block; margin: 10px 20px 10px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .links a:hover { background: #0056b3; }
        .status { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🚀 OmniFeedback API - Phase 2</h1>
    <p>Welcome to the OmniFeedback API server. This API provides comprehensive feedback and content management capabilities with multi-tenant support.</p>

    <div class="links">
        <a href="/api/docs">📚 API Documentation</a>
        <a href="/api/doc">📄 OpenAPI JSON</a>
        <a href="/health">❤️ Health Check</a>
        <a href="/api/test">🧪 Test Endpoint</a>
        <a href="/rpc">🚀 oRPC Endpoint</a>
    </div>

    <div class="status">
        <strong>Status:</strong> Running<br>
        <strong>Version:</strong> 2.0.0<br>
        <strong>Time:</strong> ${new Date().toISOString()}
    </div>
</body>
</html>`;

  return c.html(html);
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

const port = parseInt(process.env.PORT || "8080");

export default {
  port,
  fetch: app.fetch,
};
