import { cacheTTL } from '@/config';
import {
  createTag as dalCreateTag,
  deleteTag as dalDeleteTag,
  getAllTags as dalGetAllTags,
} from '@/dal/tags';
import type { Database } from '@/db';
import type { Cache } from '@/lib/cache';

function getTagsCacheKey(teamId: string): string {
  return `tags:${teamId}`;
}

/**
 * Get all tags for a team (with caching)
 */
export async function getAllTags(db: Database, teamId: string, cache: Cache) {
  const cacheKey = getTagsCacheKey(teamId);

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const tags = await dalGetAllTags(db, teamId);

  // Cache the result
  await cache.set(cacheKey, JSON.stringify(tags), cacheTTL.tags);

  return tags;
}

/**
 * Create a new tag
 * Invalidates the tags cache for the team
 */
export async function createTag(
  db: Database,
  teamId: string,
  input: { name: string; color: string },
  cache: Cache,
) {
  const newTag = await dalCreateTag(db, teamId, input);

  // Invalidate cache
  const cacheKey = getTagsCacheKey(teamId);
  await cache.delete(cacheKey);

  return newTag;
}

/**
 * Delete a tag
 * Invalidates the tags cache for the team
 */
export async function deleteTag(
  db: Database,
  teamId: string,
  tagId: string,
  cache: Cache,
) {
  const deletedTag = await dalDeleteTag(db, tagId);

  if (deletedTag) {
    // Invalidate cache
    const cacheKey = getTagsCacheKey(teamId);
    await cache.delete(cacheKey);
  }

  return deletedTag;
}
