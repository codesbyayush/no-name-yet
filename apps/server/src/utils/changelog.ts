import { Block } from "@blocknote/core";
import { generateExcerpt, validateBlockNoteContent } from "./blocknote";

/**
 * Generates a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validates changelog input data
 */
export interface ChangelogValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateChangelogInput(input: {
  title?: string;
  slug?: string;
  content?: any;
  excerpt?: string;
  version?: string;
  tags?: string[];
}): ChangelogValidationResult {
  const errors: string[] = [];

  // Validate title
  if (!input.title || typeof input.title !== "string" || input.title.trim().length === 0) {
    errors.push("Title is required and must be a non-empty string");
  } else if (input.title.length > 200) {
    errors.push("Title must be 200 characters or less");
  }

  // Validate slug
  if (!input.slug || typeof input.slug !== "string" || input.slug.trim().length === 0) {
    errors.push("Slug is required and must be a non-empty string");
  } else if (input.slug.length > 100) {
    errors.push("Slug must be 100 characters or less");
  } else if (!/^[a-z0-9-]+$/.test(input.slug)) {
    errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
  }

  // Validate content
  if (!input.content) {
    errors.push("Content is required");
  } else if (!validateBlockNoteContent(input.content)) {
    errors.push("Content must be valid BlockNote JSON format");
  }

  // Validate excerpt (optional)
  if (input.excerpt && typeof input.excerpt !== "string") {
    errors.push("Excerpt must be a string");
  } else if (input.excerpt && input.excerpt.length > 500) {
    errors.push("Excerpt must be 500 characters or less");
  }

  // Validate version (optional)
  if (input.version && typeof input.version !== "string") {
    errors.push("Version must be a string");
  } else if (input.version && input.version.length > 50) {
    errors.push("Version must be 50 characters or less");
  }

  // Validate tags (optional)
  if (input.tags) {
    if (!Array.isArray(input.tags)) {
      errors.push("Tags must be an array");
    } else if (input.tags.some(tag => typeof tag !== "string")) {
      errors.push("All tags must be strings");
    } else if (input.tags.length > 20) {
      errors.push("Maximum 20 tags allowed");
    } else if (input.tags.some(tag => tag.length > 50)) {
      errors.push("Each tag must be 50 characters or less");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Processes changelog content for storage
 */
export interface ProcessedChangelogContent {
  content: Block[];
  htmlContent: string;
  excerpt: string;
}

export async function processChangelogContent(
  content: Block[],
  providedExcerpt?: string
): Promise<ProcessedChangelogContent> {
  // Import the blockNoteToHTML function dynamically to avoid circular imports
  const { blockNoteToHTML } = await import("./blocknote");
  
  // Generate HTML content
  const htmlContent = await blockNoteToHTML(content);
  
  // Generate excerpt if not provided
  const excerpt = providedExcerpt || generateExcerpt(content);
  
  return {
    content,
    htmlContent,
    excerpt,
  };
}

/**
 * Sanitizes HTML content for safe display
 */
export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - in production, consider using a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
    .replace(/javascript:/gi, ""); // Remove javascript: URLs
}

/**
 * Generates meta description from content if not provided
 */
export function generateMetaDescription(content: Block[], providedDescription?: string): string {
  if (providedDescription) {
    return providedDescription.substring(0, 160); // Limit to 160 characters for SEO
  }
  
  const excerpt = generateExcerpt(content, 160);
  return excerpt;
}

/**
 * Validates slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100;
}