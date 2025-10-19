import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import { changelog, tags, user } from "@/db/schema";

type Database = ReturnType<typeof import("@/db").getDb>;

export type PublicGetParams = {
  offset: number;
  limit: number;
  sortBy: "newest" | "oldest" | "title";
  tagId?: string;
};

function resolvePublicOrder(sortBy: PublicGetParams["sortBy"]): SQL<unknown> {
  switch (sortBy) {
    case "oldest":
      return asc(changelog.publishedAt);
    case "title":
      return asc(changelog.title);
    default:
      return desc(changelog.publishedAt);
  }
}

export async function getPublished(
  db: Database,
  organizationId: string,
  params: PublicGetParams
) {
  const whereConditions = [
    eq(changelog.organizationId, organizationId),
    eq(changelog.status, "published"),
  ];
  if (params.tagId) {
    whereConditions.push(eq(changelog.tagId, params.tagId));
  }

  const orderBy = resolvePublicOrder(params.sortBy);

  const rows = await db
    .select({
      id: changelog.id,
      title: changelog.title,
      slug: changelog.slug,
      htmlContent: changelog.htmlContent,
      excerpt: changelog.excerpt,
      publishedAt: changelog.publishedAt,
      metaTitle: changelog.metaTitle,
      metaDescription: changelog.metaDescription,
      author: { id: user.id, name: user.name, image: user.image },
      tag: { id: tags.id, name: tags.name },
    })
    .from(changelog)
    .leftJoin(user, eq(changelog.authorId, user.id))
    .leftJoin(tags, eq(changelog.tagId, tags.id))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .offset(params.offset)
    .limit(params.limit);

  const totalCountResult = await db
    .select({ count: count() })
    .from(changelog)
    .where(and(...whereConditions));

  return { rows, totalCount: totalCountResult[0]?.count || 0 };
}

export async function getPublishedBySlug(
  db: Database,
  organizationId: string,
  slug: string
) {
  const rows = await db
    .select({
      id: changelog.id,
      title: changelog.title,
      slug: changelog.slug,
      htmlContent: changelog.htmlContent,
      excerpt: changelog.excerpt,
      publishedAt: changelog.publishedAt,
      metaTitle: changelog.metaTitle,
      metaDescription: changelog.metaDescription,
      author: { id: user.id, name: user.name, image: user.image },
      tag: { id: tags.id, name: tags.name },
    })
    .from(changelog)
    .leftJoin(user, eq(changelog.authorId, user.id))
    .leftJoin(tags, eq(changelog.tagId, tags.id))
    .where(
      and(
        eq(changelog.organizationId, organizationId),
        eq(changelog.slug, slug),
        eq(changelog.status, "published")
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export type AdminGetParams = {
  offset: number;
  limit: number;
  sortBy: "newest" | "oldest" | "title";
  status?: "draft" | "published" | "archived";
  tagId?: string;
};

function resolveAdminOrder(sortBy: AdminGetParams["sortBy"]): SQL<unknown> {
  switch (sortBy) {
    case "oldest":
      return asc(changelog.createdAt);
    case "title":
      return asc(changelog.title);
    default:
      return desc(changelog.createdAt);
  }
}

export async function getAll(
  db: Database,
  organizationId: string,
  params: AdminGetParams
) {
  const whereConditions = [eq(changelog.organizationId, organizationId)];
  if (params.status) {
    whereConditions.push(eq(changelog.status, params.status));
  }
  if (params.tagId) {
    whereConditions.push(eq(changelog.tagId, params.tagId));
  }

  const orderBy = resolveAdminOrder(params.sortBy);

  const rows = await db
    .select({
      id: changelog.id,
      title: changelog.title,
      slug: changelog.slug,
      excerpt: changelog.excerpt,
      status: changelog.status,
      publishedAt: changelog.publishedAt,
      createdAt: changelog.createdAt,
      updatedAt: changelog.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      tag: { id: tags.id, name: tags.name },
    })
    .from(changelog)
    .leftJoin(user, eq(changelog.authorId, user.id))
    .leftJoin(tags, eq(changelog.tagId, tags.id))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .offset(params.offset)
    .limit(params.limit);

  const totalCountResult = await db
    .select({ count: count() })
    .from(changelog)
    .where(and(...whereConditions));

  return { rows, totalCount: totalCountResult[0]?.count || 0 };
}

export async function getByIdForOrg(
  db: Database,
  organizationId: string,
  id: string
) {
  const rows = await db
    .select({
      id: changelog.id,
      organizationId: changelog.organizationId,
      title: changelog.title,
      slug: changelog.slug,
      content: changelog.content,
      htmlContent: changelog.htmlContent,
      excerpt: changelog.excerpt,
      status: changelog.status,
      publishedAt: changelog.publishedAt,
      authorId: changelog.authorId,
      tagId: changelog.tagId,
      createdAt: changelog.createdAt,
      updatedAt: changelog.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      tag: { id: tags.id, name: tags.name },
    })
    .from(changelog)
    .leftJoin(user, eq(changelog.authorId, user.id))
    .leftJoin(tags, eq(changelog.tagId, tags.id))
    .where(
      and(eq(changelog.id, id), eq(changelog.organizationId, organizationId))
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function ensureUniqueSlug(
  db: Database,
  organizationId: string,
  baseSlug: string,
  excludeId?: string
) {
  let slug = baseSlug;
  let counter = 0;
  // Mirrors existing logic
  while (true) {
    const whereConditions = [
      eq(changelog.organizationId, organizationId),
      eq(changelog.slug, slug),
    ];
    if (excludeId) {
      whereConditions.push(eq(changelog.id, excludeId));
    }
    const existing = await db
      .select({ id: changelog.id })
      .from(changelog)
      .where(and(...whereConditions))
      .limit(1);
    if (existing.length === 0) {
      break;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

export type InsertChangelogValues = {
  organizationId: string;
  title: string;
  slug: string;
  content: unknown;
  htmlContent?: string | null;
  status: "draft" | "published" | "archived";
  publishedAt?: Date | null;
  authorId: string;
  tagId?: string | null;
};

export async function insert(db: Database, values: InsertChangelogValues) {
  const inserted = await db.insert(changelog).values(values).returning();
  return inserted[0] ?? null;
}

export async function updateById(
  db: Database,
  id: string,
  values: Record<string, unknown>
) {
  const updated = await db
    .update(changelog)
    .set(values)
    .where(eq(changelog.id, id))
    .returning();
  return updated[0] ?? null;
}

export async function updateManyByIds(
  db: Database,
  ids: string[],
  values: Record<string, unknown>
) {
  return await db
    .update(changelog)
    .set(values)
    .where(and(inArray(changelog.id, ids)))
    .returning();
}

export async function deleteById(db: Database, id: string) {
  await db.delete(changelog).where(eq(changelog.id, id));
}
