import { eq } from 'drizzle-orm';
import type { Database } from '@/db';
import { member, user } from '@/db/schema';

export type OrganizationUserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  lastActiveAt: Date | null;
};

/**
 * Get all users in an organization with their membership role
 */
export async function getOrganizationUsers(
  db: Database,
  organizationId: string,
  limit: number,
  offset: number,
): Promise<OrganizationUserRow[]> {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: member.role,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, organizationId))
    .limit(limit)
    .offset(offset);
}
