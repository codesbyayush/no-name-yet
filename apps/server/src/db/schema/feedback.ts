import { pgTable, text, timestamp, serial, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enum for feedback types
export const feedbackTypeEnum = pgEnum("feedback_type", ["bug", "suggestion"]);

// Enum for feedback severity (for bugs)
export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);

// Enum for feedback status
export const statusEnum = pgEnum("status", ["open", "in_progress", "resolved", "closed"]);

// Tenants table - represents organizations using the widget
export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // Configuration for the tenant
  config: jsonb("config").default({}).$type<{
    theme?: {
      primaryColor?: string;
      buttonText?: string;
    };
    apiUrl?: string;
    allowedDomains?: string[];
  }>(),
});

// Feedback table - stores all feedback submissions
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  
  // Feedback content
  type: feedbackTypeEnum("type").notNull(),
  title: text("title"),
  description: text("description").notNull(),
  severity: severityEnum("severity"), // Only for bugs
  status: statusEnum("status").default("open").notNull(),
  
  // User context (from JWT or manual input)
  userId: text("user_id"), // From JWT claim
  userEmail: text("user_email"), // From JWT claim or manual input
  userName: text("user_name"), // From JWT claim or manual input
  
  // Technical context
  userAgent: text("user_agent"),
  url: text("url"), // Page where feedback was submitted
  browserInfo: jsonb("browser_info").$type<{
    platform?: string;
    language?: string;
    cookieEnabled?: boolean;
    onLine?: boolean;
    screenResolution?: string;
  }>(),
  
  // Attachments and media
  attachments: jsonb("attachments").default([]).$type<Array<{
    id: string;
    name: string;
    type: string; // image/png, application/pdf, etc.
    size: number;
    url: string; // S3 URL or similar
  }>>(),
  
  // AI processing results (will be added in Phase 3)
  aiAnalysis: jsonb("ai_analysis").$type<{
    category?: string;
    sentiment?: string;
    summary?: string;
    suggestedResponse?: string;
    confidence?: number;
  }>(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // For future features
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  tags: text("tags").array().default([]),
  priority: text("priority").default("medium"), // low, medium, high
});

// Export types for TypeScript
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;