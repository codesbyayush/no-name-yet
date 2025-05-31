import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { feedbackRouter } from "./routers/feedback";
import { tenantsRouter } from "./routers/tenants";

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

// API Routes
app.route("/api/feedback", feedbackRouter);
app.route("/api/tenants", tenantsRouter);

app.get("/", (c) => {
	return c.text("OmniFeedback API - Phase 2");
});

app.get("/health", (c) => {
	return c.json({ 
		status: "ok",
		timestamp: new Date().toISOString(),
		version: "2.0.0"
	});
});

const port = parseInt(process.env.PORT || "8080");

console.log(`🚀 OmniFeedback API Server starting on port ${port}`);

export default {
	port,
	fetch: app.fetch,
};
