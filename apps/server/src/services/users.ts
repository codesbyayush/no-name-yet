import { avatar } from '@/config';
import { getOrganizationUsers as dalGetOrganizationUsers } from '@/dal/users';
import type { Database } from '@/db';
import { getAuth } from '@/lib/auth';
import type { AppEnv } from '@/lib/env';

export type TransformedUser = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  status: 'online';
  role: string;
  joinedDate: string;
  teamIds: string[];
};

export type OrganizationUsersResult = {
  users: TransformedUser[];
  organizationId: string;
  total: number;
};

export type InviteUserInput = {
  email: string;
  role: 'member' | 'admin' | 'owner';
  teamId?: string;
};

export type InviteResult = {
  email: string;
  status: 'success' | 'failed';
  error?: string;
};

export type InviteUsersResult = {
  results: InviteResult[];
  summary: {
    total: number;
    success: number;
    failed: number;
  };
};

/**
 * Get all users in an organization with transformed data
 */
export async function getOrganizationUsers(
  db: Database,
  organizationId: string,
  limit: number,
  offset: number,
): Promise<OrganizationUsersResult> {
  const users = await dalGetOrganizationUsers(
    db,
    organizationId,
    limit,
    offset,
  );

  const transformedUsers: TransformedUser[] = users.map((orgUser) => ({
    id: orgUser.id,
    name: orgUser.name || 'Unknown User',
    avatarUrl: orgUser.image || `${avatar.baseUrl}${orgUser.id}`,
    email: orgUser.email,
    status: 'online' as const,
    role: orgUser.role,
    joinedDate: orgUser.createdAt.toISOString().split('T')[0],
    teamIds: [],
  }));

  return {
    users: transformedUsers,
    organizationId,
    total: transformedUsers.length,
  };
}

/**
 * Bulk invite users to an organization
 * Uses better-auth API to create invitations
 */
export async function inviteUsers(
  env: AppEnv,
  headers: Headers,
  organizationId: string,
  inviterId: string,
  users: InviteUserInput[],
): Promise<InviteUsersResult> {
  const auth = getAuth(env);

  const invitationPromises = users.map(async (invitee) => {
    await auth.api.createInvitation({
      headers,
      body: {
        email: invitee.email,
        role: invitee.role,
        organizationId,
        inviterId,
        teamId: invitee.teamId,
      },
    });
    return invitee.email;
  });

  const settledResults = await Promise.allSettled(invitationPromises);

  const results: InviteResult[] = settledResults.map((result, index) => {
    const email = users[index].email;
    if (result.status === 'fulfilled') {
      return { email, status: 'success' as const };
    }
    return {
      email,
      status: 'failed' as const,
      error:
        result.reason instanceof Error
          ? result.reason.message
          : 'Unknown error occurred',
    };
  });

  const successCount = settledResults.filter(
    (r) => r.status === 'fulfilled',
  ).length;
  const failedCount = settledResults.filter(
    (r) => r.status === 'rejected',
  ).length;

  return {
    results,
    summary: {
      total: users.length,
      success: successCount,
      failed: failedCount,
    },
  };
}
