import { eq } from 'drizzle-orm';
import { tags } from '@/db/schema/tags';

type Database = ReturnType<typeof import('@/db').getDb>;

export async function getAllTags(db: Database, organizationId: string) {
  return await db
    .select()
    .from(tags)
    .where(eq(tags.organizationId, organizationId));
}

export async function createTag(
  db: Database,
  organizationId: string,
  input: { name: string; color: string }
) {
  const [newTag] = await db
    .insert(tags)
    .values({
      name: input.name.trim(),
      color: input.color,
      organizationId,
    })
    .returning();
  return newTag ?? null;
}

export async function deleteTag(db: Database, id: string) {
  const [deletedTag] = await db.delete(tags).where(eq(tags.id, id)).returning();
  return deletedTag ?? null;
}
