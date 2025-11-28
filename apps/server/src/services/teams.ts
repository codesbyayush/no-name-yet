import { ORPCError } from '@orpc/server';
import type { Database } from '@/dal/posts';
import { getTeamById, getTeamMembers, verifyTeamOwnership } from '@/dal/teams';
import { getAuth } from '@/lib/auth';
import type { AppEnv } from '@/lib/env';

/**
 * Get team members with details for a specific team
 * Business logic: Verifies team ownership before returning members
 */
export async function getTeamMembersWithDetails(
  db: Database,
  teamId: string,
  organizationId: string,
) {
  // Verify team belongs to organization
  const teamData = await verifyTeamOwnership(db, teamId, organizationId);

  if (!teamData) {
    throw new ORPCError('NOT_FOUND', { message: 'Team not found' });
  }

  // Get members
  const members = await getTeamMembers(db, teamId);

  return {
    teamId,
    members,
    teamName: teamData.name,
    totalMembers: members.length,
  };
}

/**
 * Create a new team with the creator as first member
 * Business logic: Orchestrates team creation via auth service and member addition
 */
export async function createTeamWithMember(
  env: AppEnv,
  teamName: string,
  organizationId: string,
  userId: string,
  headers: Headers,
) {
  const auth = getAuth(env);

  // Create team via auth service
  const createdTeam = await auth.api.createTeam({
    body: {
      name: teamName,
      organizationId,
    },
    headers,
  });

  // Add creator as first member
  const addedMember = await auth.api.addTeamMember({
    body: {
      teamId: createdTeam.id,
      userId,
      role: 'member',
    },
    headers,
  });

  return {
    teamId: createdTeam.id,
    members: [addedMember],
    teamName: createdTeam.name,
    totalMembers: 1,
  };
}
