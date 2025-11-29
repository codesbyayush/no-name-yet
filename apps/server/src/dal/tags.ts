import { eq } from 'drizzle-orm';
import type { Database } from '@/db';
import { tags } from '@/db/schema/tags';

export async function getAllTags(db: Database, teamId: string) {
  return await db.select().from(tags).where(eq(tags.teamId, teamId));
}

export async function createTag(
  db: Database,
  teamId: string,
  input: { name: string; color: string },
) {
  const [newTag] = await db
    .insert(tags)
    .values({
      name: input.name.trim(),
      color: input.color,
      teamId,
    })
    .returning();
  return newTag ?? null;
}

export async function deleteTag(db: Database, id: string) {
  const [deletedTag] = await db.delete(tags).where(eq(tags.id, id)).returning();
  return deletedTag ?? null;
}
