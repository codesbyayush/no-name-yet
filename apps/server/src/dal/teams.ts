import { and, eq } from 'drizzle-orm';
import type { Database } from '@/db';
import { team, teamMember, user } from '@/db/schema';

/**
 * Get team by ID
 */
export async function getTeamById(db: Database, teamId: string) {
  const [result] = await db
    .select()
    .from(team)
    .where(eq(team.id, teamId))
    .limit(1);
  return result || null;
}

/**
 * Get team by organization ID
 */
export async function getTeamsByOrganizationId(
  db: Database,
  organizationId: string,
) {
  return await db
    .select()
    .from(team)
    .where(eq(team.organizationId, organizationId));
}

/**
 * Get team members with user details
 */
export async function getTeamMembers(db: Database, teamId: string) {
  return await db
    .select({
      memberId: teamMember.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      joinedTeamAt: teamMember.createdAt,
    })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.teamId, teamId));
}

/**
 * Verify team belongs to organization
 */
export async function verifyTeamOwnership(
  db: Database,
  teamId: string,
  organizationId: string,
) {
  const [result] = await db
    .select()
    .from(team)
    .where(and(eq(team.id, teamId), eq(team.organizationId, organizationId)))
    .limit(1);
  return result || null;
}

/**
 * Check if user is member of team
 */
export async function isUserTeamMember(
  db: Database,
  teamId: string,
  userId: string,
) {
  const [result] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
    .limit(1);
  return !!result;
}
