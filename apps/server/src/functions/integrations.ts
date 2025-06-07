import { db } from "../db";
import { integrations, postIntegrations, type Integration, type NewIntegration, type PostIntegration, type NewPostIntegration } from "../db/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";

export interface CreateIntegrationData {
  tenantId: number;
  type: "jira" | "salesforce" | "slack" | "zendesk";
  config: {
    apiKey?: string;
    apiUrl?: string;
    webhookUrl?: string;
    credentials?: {
      clientId?: string;
      clientSecret?: string;
      accessToken?: string;
      refreshToken?: string;
    };
    settings?: {
      syncEnabled?: boolean;
      syncFrequency?: string; // cron expression
      fieldMappings?: Record<string, string>;
      filters?: Record<string, any>;
    };
    metadata?: Record<string, any>;
  };
}

export interface UpdateIntegrationData {
  config?: {
    apiKey?: string;
    apiUrl?: string;
    webhookUrl?: string;
    credentials?: {
      clientId?: string;
      clientSecret?: string;
      accessToken?: string;
      refreshToken?: string;
    };
    settings?: {
      syncEnabled?: boolean;
      syncFrequency?: string;
      fieldMappings?: Record<string, string>;
      filters?: Record<string, any>;
    };
    metadata?: Record<string, any>;
  };
  lastSync?: Date;
}

export interface CreatePostIntegrationData {
  postId: number;
  integrationId: number;
  externalId: string;
  data?: {
    externalUrl?: string;
    status?: string;
    assignedTo?: string;
    priority?: string;
    labels?: string[];
    customFields?: Record<string, any>;
    syncStatus?: "pending" | "synced" | "error";
    lastSyncedAt?: string;
    syncErrors?: string[];
  };
}

export interface UpdatePostIntegrationData {
  externalId?: string;
  data?: {
    externalUrl?: string;
    status?: string;
    assignedTo?: string;
    priority?: string;
    labels?: string[];
    customFields?: Record<string, any>;
    syncStatus?: "pending" | "synced" | "error";
    lastSyncedAt?: string;
    syncErrors?: string[];
  };
}

export interface IntegrationFilters {
  tenantId: number;
  type?: "jira" | "salesforce" | "slack" | "zendesk";
  syncEnabled?: boolean;
  limit?: number;
  offset?: number;
}

export interface PostIntegrationFilters {
  postId?: number;
  integrationId?: number;
  syncStatus?: "pending" | "synced" | "error";
  limit?: number;
  offset?: number;
}

export class IntegrationFunctions {
  static async createIntegration(integrationData: CreateIntegrationData): Promise<Integration> {
    try {
      // Validate required config based on integration type
      const validationResult = this.validateIntegrationConfig(integrationData.type, integrationData.config);
      if (!validationResult.isValid) {
        throw new Error(`Invalid configuration: ${validationResult.error}`);
      }

      const [newIntegration] = await db
        .insert(integrations)
        .values({
          tenantId: integrationData.tenantId,
          type: integrationData.type,
          config: integrationData.config,
        })
        .returning();

      return newIntegration;
    } catch (error) {
      throw new Error(`Failed to create integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getIntegrationById(integrationId: number, tenantId: number): Promise<Integration | null> {
    try {
      const integration = await db.query.integrations.findFirst({
        where: and(
          eq(integrations.id, integrationId),
          eq(integrations.tenantId, tenantId)
        ),
      });

      return integration || null;
    } catch (error) {
      throw new Error(`Failed to get integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getIntegrationsByTenant(filters: IntegrationFilters): Promise<Integration[]> {
    try {
      const conditions = [eq(integrations.tenantId, filters.tenantId)];

      if (filters.type) {
        conditions.push(eq(integrations.type, filters.type));
      }

      let integrationsList = await db.query.integrations.findMany({
        where: and(...conditions),
        orderBy: [desc(integrations.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      // Filter by sync enabled status if specified
      if (filters.syncEnabled !== undefined) {
        integrationsList = integrationsList.filter(integration =>
          integration.config.settings?.syncEnabled === filters.syncEnabled
        );
      }

      return integrationsList;
    } catch (error) {
      throw new Error(`Failed to get integrations by tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateIntegration(integrationId: number, tenantId: number, updateData: UpdateIntegrationData): Promise<Integration> {
    try {
      // Get current integration
      const currentIntegration = await this.getIntegrationById(integrationId, tenantId);
      if (!currentIntegration) {
        throw new Error("Integration not found");
      }

      // Merge configs if provided
      let newConfig = currentIntegration.config;
      if (updateData.config) {
        newConfig = {
          ...currentIntegration.config,
          ...updateData.config,
          credentials: {
            ...currentIntegration.config.credentials,
            ...updateData.config.credentials,
          },
          settings: {
            ...currentIntegration.config.settings,
            ...updateData.config.settings,
          },
          metadata: {
            ...currentIntegration.config.metadata,
            ...updateData.config.metadata,
          },
        };

        // Validate updated config
        const validationResult = this.validateIntegrationConfig(currentIntegration.type, newConfig);
        if (!validationResult.isValid) {
          throw new Error(`Invalid configuration: ${validationResult.error}`);
        }
      }

      const [updatedIntegration] = await db
        .update(integrations)
        .set({
          config: newConfig,
          lastSync: updateData.lastSync,
          updatedAt: new Date(),
        })
        .where(and(
          eq(integrations.id, integrationId),
          eq(integrations.tenantId, tenantId)
        ))
        .returning();

      if (!updatedIntegration) {
        throw new Error("Integration not found");
      }

      return updatedIntegration;
    } catch (error) {
      throw new Error(`Failed to update integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteIntegration(integrationId: number, tenantId: number): Promise<void> {
    try {
      // First delete all post integrations
      await db
        .delete(postIntegrations)
        .where(eq(postIntegrations.integrationId, integrationId));

      // Then delete the integration
      const deletedRows = await db
        .delete(integrations)
        .where(and(
          eq(integrations.id, integrationId),
          eq(integrations.tenantId, tenantId)
        ));

      if (deletedRows.rowCount === 0) {
        throw new Error("Integration not found");
      }
    } catch (error) {
      throw new Error(`Failed to delete integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateLastSync(integrationId: number, tenantId: number): Promise<void> {
    try {
      await db
        .update(integrations)
        .set({
          lastSync: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(integrations.id, integrationId),
          eq(integrations.tenantId, tenantId)
        ));
    } catch (error) {
      throw new Error(`Failed to update last sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Post Integration Functions
  static async createPostIntegration(postIntegrationData: CreatePostIntegrationData): Promise<PostIntegration> {
    try {
      // Verify integration exists
      const integration = await db.query.integrations.findFirst({
        where: eq(integrations.id, postIntegrationData.integrationId),
      });

      if (!integration) {
        throw new Error("Integration not found");
      }

      // Check if post integration already exists
      const existingPostIntegration = await db.query.postIntegrations.findFirst({
        where: and(
          eq(postIntegrations.postId, postIntegrationData.postId),
          eq(postIntegrations.integrationId, postIntegrationData.integrationId)
        ),
      });

      if (existingPostIntegration) {
        throw new Error("Post integration already exists");
      }

      const [newPostIntegration] = await db
        .insert(postIntegrations)
        .values({
          postId: postIntegrationData.postId,
          integrationId: postIntegrationData.integrationId,
          externalId: postIntegrationData.externalId,
          data: postIntegrationData.data || {},
        })
        .returning();

      return newPostIntegration;
    } catch (error) {
      throw new Error(`Failed to create post integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostIntegrationById(postIntegrationId: number): Promise<PostIntegration | null> {
    try {
      const postIntegration = await db.query.postIntegrations.findFirst({
        where: eq(postIntegrations.id, postIntegrationId),
      });

      return postIntegration || null;
    } catch (error) {
      throw new Error(`Failed to get post integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostIntegrationsByPost(postId: number, filters: PostIntegrationFilters = {}): Promise<PostIntegration[]> {
    try {
      const conditions = [eq(postIntegrations.postId, postId)];

      if (filters.integrationId) {
        conditions.push(eq(postIntegrations.integrationId, filters.integrationId));
      }

      let postIntegrationsList = await db.query.postIntegrations.findMany({
        where: and(...conditions),
        orderBy: [desc(postIntegrations.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      // Filter by sync status if specified
      if (filters.syncStatus) {
        postIntegrationsList = postIntegrationsList.filter(pi =>
          pi.data?.syncStatus === filters.syncStatus
        );
      }

      return postIntegrationsList;
    } catch (error) {
      throw new Error(`Failed to get post integrations by post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostIntegrationsByIntegration(integrationId: number, filters: PostIntegrationFilters = {}): Promise<PostIntegration[]> {
    try {
      const conditions = [eq(postIntegrations.integrationId, integrationId)];

      if (filters.postId) {
        conditions.push(eq(postIntegrations.postId, filters.postId));
      }

      let postIntegrationsList = await db.query.postIntegrations.findMany({
        where: and(...conditions),
        orderBy: [desc(postIntegrations.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      // Filter by sync status if specified
      if (filters.syncStatus) {
        postIntegrationsList = postIntegrationsList.filter(pi =>
          pi.data?.syncStatus === filters.syncStatus
        );
      }

      return postIntegrationsList;
    } catch (error) {
      throw new Error(`Failed to get post integrations by integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updatePostIntegration(postIntegrationId: number, updateData: UpdatePostIntegrationData): Promise<PostIntegration> {
    try {
      // Get current post integration
      const currentPostIntegration = await this.getPostIntegrationById(postIntegrationId);
      if (!currentPostIntegration) {
        throw new Error("Post integration not found");
      }

      // Merge data if provided
      let newData = currentPostIntegration.data || {};
      if (updateData.data) {
        newData = {
          ...newData,
          ...updateData.data,
        };
      }

      const [updatedPostIntegration] = await db
        .update(postIntegrations)
        .set({
          externalId: updateData.externalId || currentPostIntegration.externalId,
          data: newData,
          updatedAt: new Date(),
        })
        .where(eq(postIntegrations.id, postIntegrationId))
        .returning();

      if (!updatedPostIntegration) {
        throw new Error("Post integration not found");
      }

      return updatedPostIntegration;
    } catch (error) {
      throw new Error(`Failed to update post integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deletePostIntegration(postIntegrationId: number): Promise<void> {
    try {
      const deletedRows = await db
        .delete(postIntegrations)
        .where(eq(postIntegrations.id, postIntegrationId));

      if (deletedRows.rowCount === 0) {
        throw new Error("Post integration not found");
      }
    } catch (error) {
      throw new Error(`Failed to delete post integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateSyncStatus(postIntegrationId: number, syncStatus: "pending" | "synced" | "error", syncErrors?: string[]): Promise<void> {
    try {
      const currentPostIntegration = await this.getPostIntegrationById(postIntegrationId);
      if (!currentPostIntegration) {
        throw new Error("Post integration not found");
      }

      const newData = {
        ...currentPostIntegration.data,
        syncStatus,
        lastSyncedAt: new Date().toISOString(),
        ...(syncErrors && { syncErrors }),
      };

      await db
        .update(postIntegrations)
        .set({
          data: newData,
          updatedAt: new Date(),
        })
        .where(eq(postIntegrations.id, postIntegrationId));
    } catch (error) {
      throw new Error(`Failed to update sync status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility Functions
  static validateIntegrationConfig(type: "jira" | "salesforce" | "slack" | "zendesk", config: any): { isValid: boolean; error?: string } {
    switch (type) {
      case "jira":
        if (!config.apiUrl) {
          return { isValid: false, error: "JIRA integration requires apiUrl" };
        }
        if (!config.credentials?.accessToken && !config.apiKey) {
          return { isValid: false, error: "JIRA integration requires either accessToken or apiKey" };
        }
        break;

      case "salesforce":
        if (!config.credentials?.clientId || !config.credentials?.clientSecret) {
          return { isValid: false, error: "Salesforce integration requires clientId and clientSecret" };
        }
        break;

      case "slack":
        if (!config.credentials?.accessToken) {
          return { isValid: false, error: "Slack integration requires accessToken" };
        }
        break;

      case "zendesk":
        if (!config.apiUrl) {
          return { isValid: false, error: "Zendesk integration requires apiUrl" };
        }
        if (!config.apiKey) {
          return { isValid: false, error: "Zendesk integration requires apiKey" };
        }
        break;

      default:
        return { isValid: false, error: "Unknown integration type" };
    }

    return { isValid: true };
  }

  static async getIntegrationStats(tenantId: number) {
    try {
      const allIntegrations = await db.query.integrations.findMany({
        where: eq(integrations.tenantId, tenantId),
        columns: {
          id: true,
          type: true,
          config: true,
          lastSync: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allIntegrations.length,
        byType: allIntegrations.reduce((acc, integration) => {
          acc[integration.type] = (acc[integration.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        enabled: allIntegrations.filter(i => i.config.settings?.syncEnabled).length,
        recentlyActive: allIntegrations.filter(i => i.lastSync && i.lastSync > oneWeekAgo).length,
        newThisWeek: allIntegrations.filter(i => i.createdAt > oneWeekAgo).length,
        newThisMonth: allIntegrations.filter(i => i.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get integration stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostIntegrationStats(integrationId?: number) {
    try {
      const conditions = [];
      if (integrationId) {
        conditions.push(eq(postIntegrations.integrationId, integrationId));
      }

      const allPostIntegrations = await db.query.postIntegrations.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        columns: {
          id: true,
          data: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allPostIntegrations.length,
        byStatus: allPostIntegrations.reduce((acc, pi) => {
          const status = pi.data?.syncStatus || "unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        newThisWeek: allPostIntegrations.filter(pi => pi.createdAt > oneWeekAgo).length,
        newThisMonth: allPostIntegrations.filter(pi => pi.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get post integration stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
