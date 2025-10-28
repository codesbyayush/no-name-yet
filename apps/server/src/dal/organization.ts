import { eq } from 'drizzle-orm';
import { team } from '@/db/schema';

type Database = ReturnType<typeof import('@/db').getDb>;

export async function getTeamDetails(db: Database, teamId: string) {
  const teamDetails = await db.select().from(team).where(eq(team.id, teamId));
  return teamDetails;
}
