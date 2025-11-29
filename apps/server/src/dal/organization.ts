import { eq } from 'drizzle-orm';
import type { Database } from '@/db';
import { team } from '@/db/schema';

export async function getTeamDetails(db: Database, teamId: string) {
  const teamDetails = await db.select().from(team).where(eq(team.id, teamId));
  return teamDetails;
}
