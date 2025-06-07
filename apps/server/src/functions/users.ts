import { db } from "../db";
import { user, userAuth, type User, type NewUser } from "../db/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";

export interface CreateUserData {
  name: string;
  email: string;
  emailVerified: boolean;
  tenantId?: number;
  authProvider?: string;
  externalId?: string;
  role?: string;
  image?: string;
  customFields?: Record<string, any>;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  role?: string;
  image?: string;
  customFields?: Record<string, any>;
  lastActiveAt?: Date;
}

export interface CreateUserAuthData {
  userId: string;
  passwordHash?: string;
  mfaSecret?: string;
  recoveryCodes?: string[];
}

export interface UserFilters {
  tenantId?: number;
  role?: string;
  authProvider?: string;
  isDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export class UserFunctions {
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const [newUser] = await db
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          name: userData.name,
          email: userData.email,
          emailVerified: userData.emailVerified,
          tenantId: userData.tenantId,
          authProvider: userData.authProvider || "email",
          externalId: userData.externalId,
          role: userData.role || "user",
          image: userData.image,
          customFields: userData.customFields,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newUser;
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const foundUser = await db.query.user.findFirst({
        where: and(eq(user.id, userId), isNull(user.deletedAt)),
      });

      return foundUser || null;
    } catch (error) {
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUserByEmail(email: string, tenantId?: number): Promise<User | null> {
    try {
      const conditions = [eq(user.email, email), isNull(user.deletedAt)];
      if (tenantId) {
        conditions.push(eq(user.tenantId, tenantId));
      }

      const foundUser = await db.query.user.findFirst({
        where: and(...conditions),
      });

      return foundUser || null;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUsersByTenant(tenantId: number, filters: UserFilters = {}): Promise<User[]> {
    try {
      const conditions = [eq(user.tenantId, tenantId), isNull(user.deletedAt)];

      if (filters.role) {
        conditions.push(eq(user.role, filters.role));
      }

      if (filters.authProvider) {
        conditions.push(eq(user.authProvider, filters.authProvider));
      }

      const users = await db.query.user.findMany({
        where: and(...conditions),
        orderBy: [desc(user.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      return users;
    } catch (error) {
      throw new Error(`Failed to get users by tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      const [updatedUser] = await db
        .update(user)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(user.id, userId), isNull(user.deletedAt)))
        .returning();

      if (!updatedUser) {
        throw new Error("User not found or already deleted");
      }

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateLastActive(userId: string): Promise<void> {
    try {
      await db
        .update(user)
        .set({
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(user.id, userId), isNull(user.deletedAt)));
    } catch (error) {
      throw new Error(`Failed to update last active: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async softDeleteUser(userId: string): Promise<User> {
    try {
      const [deletedUser] = await db
        .update(user)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(user.id, userId), isNull(user.deletedAt)))
        .returning();

      if (!deletedUser) {
        throw new Error("User not found or already deleted");
      }

      return deletedUser;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async restoreUser(userId: string): Promise<User> {
    try {
      const [restoredUser] = await db
        .update(user)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning();

      if (!restoredUser) {
        throw new Error("User not found");
      }

      return restoredUser;
    } catch (error) {
      throw new Error(`Failed to restore user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // User Auth Functions
  static async createUserAuth(authData: CreateUserAuthData): Promise<void> {
    try {
      await db.insert(userAuth).values({
        userId: authData.userId,
        passwordHash: authData.passwordHash,
        mfaSecret: authData.mfaSecret,
        recoveryCodes: authData.recoveryCodes,
        failedAttempts: 0,
      });
    } catch (error) {
      throw new Error(`Failed to create user auth: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUserAuth(userId: string) {
    try {
      const auth = await db.query.userAuth.findFirst({
        where: eq(userAuth.userId, userId),
      });

      return auth;
    } catch (error) {
      throw new Error(`Failed to get user auth: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    try {
      await db
        .update(userAuth)
        .set({ passwordHash })
        .where(eq(userAuth.userId, userId));
    } catch (error) {
      throw new Error(`Failed to update password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async incrementFailedAttempts(userId: string): Promise<number> {
    try {
      const currentAuth = await this.getUserAuth(userId);
      if (!currentAuth) {
        throw new Error("User auth not found");
      }

      const newFailedAttempts = (currentAuth.failedAttempts || 0) + 1;

      await db
        .update(userAuth)
        .set({
          failedAttempts: newFailedAttempts,
          lockedUntil: newFailedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : undefined // Lock for 30 minutes after 5 failed attempts
        })
        .where(eq(userAuth.userId, userId));

      return newFailedAttempts;
    } catch (error) {
      throw new Error(`Failed to increment failed attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await db
        .update(userAuth)
        .set({
          failedAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date()
        })
        .where(eq(userAuth.userId, userId));
    } catch (error) {
      throw new Error(`Failed to reset failed attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async isUserLocked(userId: string): Promise<boolean> {
    try {
      const auth = await this.getUserAuth(userId);
      if (!auth || !auth.lockedUntil) {
        return false;
      }

      return new Date() < auth.lockedUntil;
    } catch (error) {
      throw new Error(`Failed to check user lock status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async searchUsers(query: string, tenantId?: number, limit = 20): Promise<User[]> {
    try {
      // This is a basic implementation - in production you'd want full-text search
      const conditions = [
        isNull(user.deletedAt),
      ];

      if (tenantId) {
        conditions.push(eq(user.tenantId, tenantId));
      }

      const users = await db.query.user.findMany({
        where: and(...conditions),
        orderBy: [asc(user.name)],
        limit,
      });

      // Filter by query (basic string matching)
      return users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUserStats(tenantId?: number) {
    try {
      const conditions = [isNull(user.deletedAt)];
      if (tenantId) {
        conditions.push(eq(user.tenantId, tenantId));
      }

      const allUsers = await db.query.user.findMany({
        where: and(...conditions),
        columns: {
          id: true,
          role: true,
          authProvider: true,
          createdAt: true,
          lastActiveAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allUsers.length,
        byRole: allUsers.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byAuthProvider: allUsers.reduce((acc, user) => {
          acc[user.authProvider] = (acc[user.authProvider] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        activeLastWeek: allUsers.filter(u => u.lastActiveAt && u.lastActiveAt > oneWeekAgo).length,
        activeLastMonth: allUsers.filter(u => u.lastActiveAt && u.lastActiveAt > oneMonthAgo).length,
        newThisWeek: allUsers.filter(u => u.createdAt > oneWeekAgo).length,
        newThisMonth: allUsers.filter(u => u.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
