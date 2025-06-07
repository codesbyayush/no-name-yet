import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { feedbackRouter } from "./routers/feedback";
import { tenantsRouter } from "./routers/tenants";
import { usersRouter } from "./routers/users";
import { boardsRouter } from "./routers/boards";
import { postsRouter } from "./routers/posts";
import { openAPIApp } from "./openapi/app";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: "*", // Allow all origins for embeddable widget
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Tenant-ID"],
    credentials: false, // Set to false when allowing all origins
  }),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// Direct docs route for convenience
app.get("/docs", (c) => c.redirect("/api/docs"));

// OpenAPI Documentation Routes
app.route("/api", openAPIApp);

// API Routes
app.route("/api/feedback", feedbackRouter);
app.route("/api/tenants", tenantsRouter);
app.route("/api/users", usersRouter);
app.route("/api/boards", boardsRouter);
app.route("/api/posts", postsRouter);

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

console.log(`🚀 OmniFeedback API Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
