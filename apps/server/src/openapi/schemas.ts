import { z } from "zod";

// Common schemas
export const ErrorSchema = z.object({
  error: z.string().describe("Error type"),
  message: z.string().describe("Detailed error message"),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean().describe("Indicates if the operation was successful"),
  message: z.string().optional().describe("Success message"),
});

export const PaginationSchema = z.object({
  limit: z.number().describe("Number of items per page"),
  offset: z.number().describe("Number of items skipped"),
  total: z.number().describe("Total number of items"),
  hasMore: z
    .boolean()
    .optional()
    .describe("Whether there are more items available"),
});

// Tenant schemas
export const TenantSchema = z.object({
  id: z.number().describe("Unique tenant identifier"),
  name: z.string().describe("Tenant name"),
  slug: z.string().describe("Unique tenant slug"),
  plan: z.enum(["starter", "pro", "enterprise"]).describe("Subscription plan"),
  stripeCustomerId: z.string().nullable().describe("Stripe customer ID"),
  billingEmail: z.string().email().nullable().describe("Billing email address"),
  email: z.string().email().nullable().describe("Contact email"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
  isActive: z.boolean().describe("Whether the tenant is active"),
  config: z.record(z.any()).describe("Tenant configuration"),
});

export const CreateTenantSchema = z.object({
  name: z.string().min(1).describe("Tenant name"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .describe("Unique tenant slug"),
  plan: z.enum(["starter", "pro", "enterprise"]).optional().default("starter"),
  billingEmail: z.string().email().optional().describe("Billing email address"),
  email: z.string().email().optional().describe("Contact email"),
  config: z.record(z.any()).optional().describe("Tenant configuration"),
});

export const UpdateTenantSchema = z.object({
  name: z.string().min(1).optional().describe("Tenant name"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .describe("Unique tenant slug"),
  plan: z.enum(["starter", "pro", "enterprise"]).optional(),
  billingEmail: z.string().email().optional().describe("Billing email address"),
  email: z.string().email().optional().describe("Contact email"),
  isActive: z.boolean().optional().describe("Whether the tenant is active"),
  config: z.record(z.any()).optional().describe("Tenant configuration"),
});

// User schemas
export const UserSchema = z.object({
  id: z.string().describe("Unique user identifier"),
  name: z.string().describe("User's full name"),
  email: z.string().email().describe("User's email address"),
  emailVerified: z.boolean().describe("Whether email is verified"),
  image: z.string().nullable().describe("User's profile image URL"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
  tenantId: z.number().nullable().describe("Associated tenant ID"),
  authProvider: z.string().describe("Authentication provider"),
  externalId: z.string().nullable().describe("External provider user ID"),
  role: z.enum(["user", "admin", "moderator"]).describe("User role"),
  customFields: z.record(z.any()).nullable().describe("Custom field values"),
  lastActiveAt: z
    .string()
    .datetime()
    .nullable()
    .describe("Last activity timestamp"),
  deletedAt: z.string().datetime().nullable().describe("Deletion timestamp"),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1).describe("User's full name"),
  email: z.string().email().describe("User's email address"),
  emailVerified: z
    .boolean()
    .default(false)
    .describe("Whether email is verified"),
  tenantId: z.number().optional().describe("Associated tenant ID"),
  authProvider: z
    .string()
    .optional()
    .default("email")
    .describe("Authentication provider"),
  externalId: z.string().optional().describe("External provider user ID"),
  role: z
    .enum(["user", "admin", "moderator"])
    .optional()
    .default("user")
    .describe("User role"),
  image: z.string().url().optional().describe("User's profile image URL"),
  customFields: z.record(z.any()).optional().describe("Custom field values"),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional().describe("User's full name"),
  email: z.string().email().optional().describe("User's email address"),
  emailVerified: z.boolean().optional().describe("Whether email is verified"),
  role: z.enum(["user", "admin", "moderator"]).optional().describe("User role"),
  image: z.string().url().optional().describe("User's profile image URL"),
  customFields: z.record(z.any()).optional().describe("Custom field values"),
});

export const UserAuthSchema = z.object({
  userId: z.string().describe("User ID"),
  hasMFA: z.boolean().describe("Whether MFA is enabled"),
  hasRecoveryCodes: z.boolean().describe("Whether recovery codes are set"),
  failedAttempts: z.number().describe("Number of failed login attempts"),
  isLocked: z.boolean().describe("Whether account is locked"),
  lastLogin: z.string().datetime().nullable().describe("Last login timestamp"),
});

// Board schemas
export const BoardSchema = z.object({
  id: z.number().describe("Unique board identifier"),
  tenantId: z.number().describe("Associated tenant ID"),
  name: z.string().describe("Board name"),
  slug: z.string().describe("Board slug"),
  description: z.string().nullable().describe("Board description"),
  isPrivate: z.boolean().describe("Whether board is private"),
  postCount: z.number().describe("Number of posts in board"),
  viewCount: z.number().describe("Number of board views"),
  customFields: z.record(z.any()).nullable().describe("Custom field values"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
  deletedAt: z.string().datetime().nullable().describe("Deletion timestamp"),
});

export const CreateBoardSchema = z.object({
  tenantId: z.number().describe("Associated tenant ID"),
  name: z.string().min(1).describe("Board name"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .describe("Board slug"),
  description: z.string().optional().describe("Board description"),
  isPrivate: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether board is private"),
  customFields: z.record(z.any()).optional().describe("Custom field values"),
});

export const UpdateBoardSchema = z.object({
  name: z.string().min(1).optional().describe("Board name"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .describe("Board slug"),
  description: z.string().optional().describe("Board description"),
  isPrivate: z.boolean().optional().describe("Whether board is private"),
  customFields: z.record(z.any()).optional().describe("Custom field values"),
});

// Post schemas
export const PostSchema = z.object({
  id: z.number().describe("Unique post identifier"),
  tenantId: z.number().describe("Associated tenant ID"),
  boardId: z.number().describe("Associated board ID"),
  authorId: z.string().describe("Post author ID"),
  title: z.string().describe("Post title"),
  slug: z.string().describe("Post slug"),
  content: z.string().describe("Post content"),
  contentVector: z.record(z.any()).nullable().describe("AI content embeddings"),
  status: z
    .enum(["draft", "published", "archived", "deleted"])
    .describe("Post status"),
  upvotes: z.number().describe("Number of upvotes"),
  downvotes: z.number().describe("Number of downvotes"),
  sentimentScore: z
    .number()
    .nullable()
    .describe("AI sentiment score (-1 to 1)"),
  priority: z.number().describe("Post priority (0-10)"),
  customFields: z.record(z.any()).nullable().describe("Custom field values"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
  deletedAt: z.string().datetime().nullable().describe("Deletion timestamp"),
});

export const CreatePostSchema = z.object({
  tenantId: z.number().describe("Associated tenant ID"),
  boardId: z.number().describe("Associated board ID"),
  authorId: z.string().describe("Post author ID"),
  title: z.string().min(1).describe("Post title"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .describe("Post slug"),
  content: z.string().min(1).describe("Post content"),
  status: z
    .enum(["draft", "published", "archived", "deleted"])
    .optional()
    .default("draft"),
  priority: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .default(0)
    .describe("Post priority"),
  customFields: z.record(z.any()).optional().describe("Custom field values"),
  contentVector: z.record(z.any()).optional().describe("AI content embeddings"),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1).optional().describe("Post title"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .describe("Post slug"),
  content: z.string().min(1).optional().describe("Post content"),
  status: z.enum(["draft", "published", "archived", "deleted"]).optional(),
  priority: z.number().min(0).max(10).optional().describe("Post priority"),
  customFields: z.record(z.any()).optional().describe("Custom field values"),
  contentVector: z.record(z.any()).optional().describe("AI content embeddings"),
  sentimentScore: z
    .number()
    .min(-1)
    .max(1)
    .optional()
    .describe("AI sentiment score"),
});

// Comment schemas
export const CommentSchema = z.object({
  id: z.number().describe("Unique comment identifier"),
  tenantId: z.number().describe("Associated tenant ID"),
  postId: z.number().describe("Associated post ID"),
  parentCommentId: z
    .number()
    .nullable()
    .describe("Parent comment ID for nested replies"),
  authorId: z.string().describe("Comment author ID"),
  content: z.string().describe("Comment content"),
  sentimentScore: z
    .number()
    .nullable()
    .describe("AI sentiment score (-1 to 1)"),
  isInternal: z.boolean().describe("Whether comment is internal only"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
  deletedAt: z.string().datetime().nullable().describe("Deletion timestamp"),
});

export const CreateCommentSchema = z.object({
  tenantId: z.number().describe("Associated tenant ID"),
  postId: z.number().describe("Associated post ID"),
  parentCommentId: z
    .number()
    .optional()
    .describe("Parent comment ID for nested replies"),
  authorId: z.string().describe("Comment author ID"),
  content: z.string().min(1).describe("Comment content"),
  isInternal: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether comment is internal only"),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).optional().describe("Comment content"),
  isInternal: z
    .boolean()
    .optional()
    .describe("Whether comment is internal only"),
  sentimentScore: z
    .number()
    .min(-1)
    .max(1)
    .optional()
    .describe("AI sentiment score"),
});

// Vote schemas
export const VoteSchema = z.object({
  id: z.number().describe("Unique vote identifier"),
  tenantId: z.number().describe("Associated tenant ID"),
  postId: z.number().nullable().describe("Associated post ID"),
  commentId: z.number().nullable().describe("Associated comment ID"),
  userId: z.string().describe("User who voted"),
  type: z.enum(["upvote", "downvote", "bookmark"]).describe("Vote type"),
  weight: z.number().describe("Vote weight"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
});

export const CreateVoteSchema = z.object({
  tenantId: z.number().describe("Associated tenant ID"),
  postId: z.number().optional().describe("Associated post ID"),
  commentId: z.number().optional().describe("Associated comment ID"),
  userId: z.string().describe("User who voted"),
  type: z.enum(["upvote", "downvote", "bookmark"]).describe("Vote type"),
  weight: z.number().optional().default(1).describe("Vote weight"),
});

export const UpdateVoteSchema = z.object({
  type: z.enum(["upvote", "downvote", "bookmark"]).describe("Vote type"),
});

// Custom Field schemas
export const CustomFieldSchema = z.object({
  id: z.number().describe("Unique field identifier"),
  tenantId: z.number().describe("Associated tenant ID"),
  fieldName: z.string().describe("Field name"),
  fieldType: z
    .enum(["text", "number", "boolean", "date", "dropdown"])
    .describe("Field type"),
  entityType: z
    .enum(["user", "post", "board", "comment"])
    .describe("Entity type"),
  config: z
    .object({
      required: z.boolean().optional().describe("Whether field is required"),
      defaultValue: z.any().optional().describe("Default field value"),
      options: z
        .array(z.string())
        .optional()
        .describe("Options for dropdown fields"),
      validation: z
        .object({
          min: z.number().optional().describe("Minimum value/length"),
          max: z.number().optional().describe("Maximum value/length"),
          pattern: z.string().optional().describe("Validation regex pattern"),
        })
        .optional()
        .describe("Validation rules"),
      description: z.string().optional().describe("Field description"),
      placeholder: z.string().optional().describe("Field placeholder"),
    })
    .describe("Field configuration"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
});

export const CreateCustomFieldSchema = z.object({
  tenantId: z.number().describe("Associated tenant ID"),
  fieldName: z.string().min(1).describe("Field name"),
  fieldType: z
    .enum(["text", "number", "boolean", "date", "dropdown"])
    .describe("Field type"),
  entityType: z
    .enum(["user", "post", "board", "comment"])
    .describe("Entity type"),
  config: z
    .object({
      required: z.boolean().optional().describe("Whether field is required"),
      defaultValue: z.any().optional().describe("Default field value"),
      options: z
        .array(z.string())
        .optional()
        .describe("Options for dropdown fields"),
      validation: z
        .object({
          min: z.number().optional().describe("Minimum value/length"),
          max: z.number().optional().describe("Maximum value/length"),
          pattern: z.string().optional().describe("Validation regex pattern"),
        })
        .optional()
        .describe("Validation rules"),
      description: z.string().optional().describe("Field description"),
      placeholder: z.string().optional().describe("Field placeholder"),
    })
    .describe("Field configuration"),
});

export const UpdateCustomFieldSchema = z.object({
  fieldName: z.string().min(1).optional().describe("Field name"),
  fieldType: z
    .enum(["text", "number", "boolean", "date", "dropdown"])
    .optional()
    .describe("Field type"),
  config: z
    .object({
      required: z.boolean().optional().describe("Whether field is required"),
      defaultValue: z.any().optional().describe("Default field value"),
      options: z
        .array(z.string())
        .optional()
        .describe("Options for dropdown fields"),
      validation: z
        .object({
          min: z.number().optional().describe("Minimum value/length"),
          max: z.number().optional().describe("Maximum value/length"),
          pattern: z.string().optional().describe("Validation regex pattern"),
        })
        .optional()
        .describe("Validation rules"),
      description: z.string().optional().describe("Field description"),
      placeholder: z.string().optional().describe("Field placeholder"),
    })
    .optional()
    .describe("Field configuration"),
});

export const CustomFieldValueSchema = z.object({
  id: z.number().describe("Unique value identifier"),
  fieldId: z.number().describe("Associated field ID"),
  entityId: z.number().describe("Entity ID"),
  value: z.any().describe("Field value"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
});

export const CreateCustomFieldValueSchema = z.object({
  fieldId: z.number().describe("Associated field ID"),
  entityId: z.number().describe("Entity ID"),
  value: z.any().describe("Field value"),
});

// Integration schemas
export const IntegrationSchema = z.object({
  id: z.number().describe("Unique integration identifier"),
  tenantId: z.number().describe("Associated tenant ID"),
  type: z
    .enum(["jira", "salesforce", "slack", "zendesk"])
    .describe("Integration type"),
  config: z
    .object({
      apiKey: z.string().optional().describe("API key"),
      apiUrl: z.string().optional().describe("API URL"),
      webhookUrl: z.string().optional().describe("Webhook URL"),
      credentials: z
        .object({
          clientId: z.string().optional().describe("OAuth client ID"),
          clientSecret: z.string().optional().describe("OAuth client secret"),
          accessToken: z.string().optional().describe("Access token"),
          refreshToken: z.string().optional().describe("Refresh token"),
        })
        .optional()
        .describe("OAuth credentials"),
      settings: z
        .object({
          syncEnabled: z
            .boolean()
            .optional()
            .describe("Whether sync is enabled"),
          syncFrequency: z
            .string()
            .optional()
            .describe("Sync frequency (cron expression)"),
          fieldMappings: z
            .record(z.string())
            .optional()
            .describe("Field mappings"),
          filters: z.record(z.any()).optional().describe("Sync filters"),
        })
        .optional()
        .describe("Integration settings"),
      metadata: z.record(z.any()).optional().describe("Additional metadata"),
    })
    .describe("Integration configuration"),
  lastSync: z.string().datetime().nullable().describe("Last sync timestamp"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
});

export const CreateIntegrationSchema = z.object({
  tenantId: z.number().describe("Associated tenant ID"),
  type: z
    .enum(["jira", "salesforce", "slack", "zendesk"])
    .describe("Integration type"),
  config: z
    .object({
      apiKey: z.string().optional().describe("API key"),
      apiUrl: z.string().optional().describe("API URL"),
      webhookUrl: z.string().optional().describe("Webhook URL"),
      credentials: z
        .object({
          clientId: z.string().optional().describe("OAuth client ID"),
          clientSecret: z.string().optional().describe("OAuth client secret"),
          accessToken: z.string().optional().describe("Access token"),
          refreshToken: z.string().optional().describe("Refresh token"),
        })
        .optional()
        .describe("OAuth credentials"),
      settings: z
        .object({
          syncEnabled: z
            .boolean()
            .optional()
            .describe("Whether sync is enabled"),
          syncFrequency: z
            .string()
            .optional()
            .describe("Sync frequency (cron expression)"),
          fieldMappings: z
            .record(z.string())
            .optional()
            .describe("Field mappings"),
          filters: z.record(z.any()).optional().describe("Sync filters"),
        })
        .optional()
        .describe("Integration settings"),
      metadata: z.record(z.any()).optional().describe("Additional metadata"),
    })
    .describe("Integration configuration"),
});

export const UpdateIntegrationSchema = z.object({
  config: z
    .object({
      apiKey: z.string().optional().describe("API key"),
      apiUrl: z.string().optional().describe("API URL"),
      webhookUrl: z.string().optional().describe("Webhook URL"),
      credentials: z
        .object({
          clientId: z.string().optional().describe("OAuth client ID"),
          clientSecret: z.string().optional().describe("OAuth client secret"),
          accessToken: z.string().optional().describe("Access token"),
          refreshToken: z.string().optional().describe("Refresh token"),
        })
        .optional()
        .describe("OAuth credentials"),
      settings: z
        .object({
          syncEnabled: z
            .boolean()
            .optional()
            .describe("Whether sync is enabled"),
          syncFrequency: z
            .string()
            .optional()
            .describe("Sync frequency (cron expression)"),
          fieldMappings: z
            .record(z.string())
            .optional()
            .describe("Field mappings"),
          filters: z.record(z.any()).optional().describe("Sync filters"),
        })
        .optional()
        .describe("Integration settings"),
      metadata: z.record(z.any()).optional().describe("Additional metadata"),
    })
    .optional()
    .describe("Integration configuration"),
  lastSync: z.string().datetime().optional().describe("Last sync timestamp"),
});

// Post Integration schemas
export const PostIntegrationSchema = z.object({
  id: z.number().describe("Unique post integration identifier"),
  postId: z.number().describe("Associated post ID"),
  integrationId: z.number().describe("Associated integration ID"),
  externalId: z.string().describe("External system ID"),
  data: z
    .object({
      externalUrl: z.string().optional().describe("External system URL"),
      status: z.string().optional().describe("External status"),
      assignedTo: z.string().optional().describe("Assigned user"),
      priority: z.string().optional().describe("External priority"),
      labels: z.array(z.string()).optional().describe("External labels"),
      customFields: z
        .record(z.any())
        .optional()
        .describe("External custom fields"),
      syncStatus: z
        .enum(["pending", "synced", "error"])
        .optional()
        .describe("Sync status"),
      lastSyncedAt: z.string().optional().describe("Last sync timestamp"),
      syncErrors: z.array(z.string()).optional().describe("Sync errors"),
    })
    .nullable()
    .describe("Integration data"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
});

export const CreatePostIntegrationSchema = z.object({
  postId: z.number().describe("Associated post ID"),
  integrationId: z.number().describe("Associated integration ID"),
  externalId: z.string().describe("External system ID"),
  data: z
    .object({
      externalUrl: z.string().optional().describe("External system URL"),
      status: z.string().optional().describe("External status"),
      assignedTo: z.string().optional().describe("Assigned user"),
      priority: z.string().optional().describe("External priority"),
      labels: z.array(z.string()).optional().describe("External labels"),
      customFields: z
        .record(z.any())
        .optional()
        .describe("External custom fields"),
      syncStatus: z
        .enum(["pending", "synced", "error"])
        .optional()
        .describe("Sync status"),
      lastSyncedAt: z.string().optional().describe("Last sync timestamp"),
      syncErrors: z.array(z.string()).optional().describe("Sync errors"),
    })
    .optional()
    .describe("Integration data"),
});

export const UpdatePostIntegrationSchema = z.object({
  externalId: z.string().optional().describe("External system ID"),
  data: z
    .object({
      externalUrl: z.string().optional().describe("External system URL"),
      status: z.string().optional().describe("External status"),
      assignedTo: z.string().optional().describe("Assigned user"),
      priority: z.string().optional().describe("External priority"),
      labels: z.array(z.string()).optional().describe("External labels"),
      customFields: z
        .record(z.any())
        .optional()
        .describe("External custom fields"),
      syncStatus: z
        .enum(["pending", "synced", "error"])
        .optional()
        .describe("Sync status"),
      lastSyncedAt: z.string().optional().describe("Last sync timestamp"),
      syncErrors: z.array(z.string()).optional().describe("Sync errors"),
    })
    .optional()
    .describe("Integration data"),
});

// Feedback schemas (legacy)
export const FeedbackSchema = z.object({
  id: z.number().describe("Unique feedback identifier"),
  tenantId: z.number().describe("Associated tenant ID"),
  type: z.enum(["bug", "suggestion"]).describe("Feedback type"),
  title: z.string().nullable().describe("Feedback title"),
  description: z.string().describe("Feedback description"),
  severity: z
    .enum(["low", "medium", "high", "critical"])
    .nullable()
    .describe("Bug severity"),
  status: z
    .enum(["open", "in_progress", "resolved", "closed"])
    .describe("Feedback status"),
  userId: z.string().nullable().describe("User ID"),
  userEmail: z.string().nullable().describe("User email"),
  userName: z.string().nullable().describe("User name"),
  userAgent: z.string().nullable().describe("User agent"),
  url: z.string().nullable().describe("Page URL"),
  browserInfo: z.record(z.any()).nullable().describe("Browser information"),
  attachments: z
    .array(
      z.object({
        id: z.string().describe("Attachment ID"),
        name: z.string().describe("Attachment name"),
        type: z.string().describe("MIME type"),
        size: z.number().describe("File size"),
        url: z.string().describe("File URL"),
      }),
    )
    .describe("Attachments"),
  aiAnalysis: z.record(z.any()).nullable().describe("AI analysis results"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
  updatedAt: z.string().datetime().describe("Last update timestamp"),
  isAnonymous: z.boolean().describe("Whether feedback is anonymous"),
  tags: z.array(z.string()).describe("Feedback tags"),
  priority: z.string().describe("Feedback priority"),
});

export const CreateFeedbackSchema = z.object({
  tenantId: z.number().describe("Tenant ID"),
  type: z.enum(["bug", "suggestion"]).describe("Feedback type"),
  title: z.string().optional().describe("Feedback title"),
  description: z.string().min(1).describe("Feedback description"),
  severity: z
    .enum(["low", "medium", "high", "critical"])
    .optional()
    .describe("Bug severity"),
  userId: z.string().optional().describe("User ID"),
  userEmail: z.string().email().optional().describe("User email"),
  userName: z.string().optional().describe("User name"),
  userAgent: z.string().optional().describe("User agent"),
  url: z.string().optional().describe("Page URL"),
  browserInfo: z
    .object({
      platform: z.string().optional(),
      language: z.string().optional(),
      cookieEnabled: z.boolean().optional(),
      onLine: z.boolean().optional(),
      screenResolution: z.string().optional(),
    })
    .optional()
    .describe("Browser information"),
  attachments: z
    .array(
      z.object({
        id: z.string().describe("Attachment ID"),
        name: z.string().describe("Attachment name"),
        type: z.string().describe("MIME type"),
        size: z.number().describe("File size"),
        url: z.string().describe("File URL"),
      }),
    )
    .optional()
    .default([])
    .describe("Attachments"),
  isAnonymous: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether feedback is anonymous"),
  tags: z.array(z.string()).optional().default([]).describe("Feedback tags"),
});

// Statistics schemas
export const UserStatsSchema = z.object({
  total: z.number().describe("Total number of users"),
  byRole: z.record(z.number()).describe("Users by role"),
  byAuthProvider: z.record(z.number()).describe("Users by auth provider"),
  activeLastWeek: z.number().describe("Users active in last week"),
  activeLastMonth: z.number().describe("Users active in last month"),
  newThisWeek: z.number().describe("New users this week"),
  newThisMonth: z.number().describe("New users this month"),
});

export const BoardStatsSchema = z.object({
  total: z.number().describe("Total number of boards"),
  public: z.number().describe("Public boards"),
  private: z.number().describe("Private boards"),
  totalPosts: z.number().describe("Total posts across all boards"),
  totalViews: z.number().describe("Total board views"),
  newThisWeek: z.number().describe("New boards this week"),
  newThisMonth: z.number().describe("New boards this month"),
});

export const PostStatsSchema = z.object({
  total: z.number().describe("Total number of posts"),
  byStatus: z.record(z.number()).describe("Posts by status"),
  totalUpvotes: z.number().describe("Total upvotes"),
  totalDownvotes: z.number().describe("Total downvotes"),
  highPriority: z.number().describe("High priority posts"),
  newThisWeek: z.number().describe("New posts this week"),
  newThisMonth: z.number().describe("New posts this month"),
});

export const CommentStatsSchema = z.object({
  total: z.number().describe("Total number of comments"),
  public: z.number().describe("Public comments"),
  internal: z.number().describe("Internal comments"),
  topLevel: z.number().describe("Top-level comments"),
  replies: z.number().describe("Reply comments"),
  averageSentiment: z.number().describe("Average sentiment score"),
  newThisWeek: z.number().describe("New comments this week"),
  newThisMonth: z.number().describe("New comments this month"),
});

export const VoteStatsSchema = z.object({
  total: z.number().describe("Total number of votes"),
  byType: z.record(z.number()).describe("Votes by type"),
  totalWeight: z.number().describe("Total vote weight"),
  newThisWeek: z.number().describe("New votes this week"),
  newThisMonth: z.number().describe("New votes this month"),
});

export const VoteCountsSchema = z.object({
  upvotes: z.number().describe("Number of upvotes"),
  downvotes: z.number().describe("Number of downvotes"),
  bookmarks: z.number().describe("Number of bookmarks"),
  score: z.number().describe("Vote score (upvotes - downvotes)"),
  total: z.number().describe("Total votes"),
});

// Response wrapper schemas
export const TenantResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  tenant: TenantSchema.optional(),
  data: z.union([TenantSchema, z.array(TenantSchema)]).optional(),
  pagination: PaginationSchema.optional(),
});

export const UserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  user: UserSchema.optional(),
  data: z.union([UserSchema, z.array(UserSchema), UserStatsSchema]).optional(),
  pagination: PaginationSchema.optional(),
});

export const BoardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  board: BoardSchema.optional(),
  data: z
    .union([BoardSchema, z.array(BoardSchema), BoardStatsSchema])
    .optional(),
  pagination: PaginationSchema.optional(),
});

export const PostResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  post: PostSchema.optional(),
  data: z.union([PostSchema, z.array(PostSchema), PostStatsSchema]).optional(),
  pagination: PaginationSchema.optional(),
});

export const CommentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  comment: CommentSchema.optional(),
  data: z
    .union([CommentSchema, z.array(CommentSchema), CommentStatsSchema])
    .optional(),
  pagination: PaginationSchema.optional(),
});

export const VoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  vote: VoteSchema.optional(),
  data: z
    .union([VoteSchema, z.array(VoteSchema), VoteStatsSchema, VoteCountsSchema])
    .optional(),
  pagination: PaginationSchema.optional(),
});

export const CustomFieldResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  customField: CustomFieldSchema.optional(),
  data: z
    .union([
      CustomFieldSchema,
      z.array(CustomFieldSchema),
      CustomFieldValueSchema,
      z.array(CustomFieldValueSchema),
    ])
    .optional(),
  pagination: PaginationSchema.optional(),
});

export const IntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  integration: IntegrationSchema.optional(),
  postIntegration: PostIntegrationSchema.optional(),
  data: z
    .union([
      IntegrationSchema,
      z.array(IntegrationSchema),
      PostIntegrationSchema,
      z.array(PostIntegrationSchema),
      z.record(z.number()),
    ])
    .optional(),
  pagination: PaginationSchema.optional(),
});

export const FeedbackResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  feedback: FeedbackSchema.optional(),
  data: z.union([FeedbackSchema, z.array(FeedbackSchema)]).optional(),
  pagination: PaginationSchema.optional(),
});
