import { Block } from "@blocknote/core";

/**
 * Converts BlockNote JSON content to HTML string
 * This handles the most common BlockNote block types
 */
export function blockNoteToHTML(content: any): string {
  try {
    if (!content || !content.content || !Array.isArray(content.content)) {
      return "";
    }

    return processBlocks(content.content);
  } catch (error) {
    console.error("Error converting BlockNote to HTML:", error);
    throw new Error("Failed to convert BlockNote content to HTML");
  }
}

/**
 * Processes an array of blocks, grouping list items appropriately
 */
function processBlocks(blocks: Block[]): string {
  const result: string[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "bulletListItem") {
      // Group consecutive bullet list items
      const listItems: string[] = [];
      while (i < blocks.length && blocks[i].type === "bulletListItem") {
        listItems.push(convertBlockToHTML(blocks[i]));
        i++;
      }
      result.push(`<ul>${listItems.join("")}</ul>`);
    } else if (block.type === "numberedListItem") {
      // Group consecutive numbered list items
      const listItems: string[] = [];
      while (i < blocks.length && blocks[i].type === "numberedListItem") {
        listItems.push(convertBlockToHTML(blocks[i]));
        i++;
      }
      result.push(`<ol>${listItems.join("")}</ol>`);
    } else if (block.type === "checkListItem") {
      // Group consecutive check list items
      const listItems: string[] = [];
      while (i < blocks.length && blocks[i].type === "checkListItem") {
        listItems.push(convertBlockToHTML(blocks[i]));
        i++;
      }
      result.push(`<ul class="checklist">${listItems.join("")}</ul>`);
    } else {
      result.push(convertBlockToHTML(block));
      i++;
    }
  }

  return result.join("");
}

/**
 * Converts a single BlockNote block to HTML
 */
function convertBlockToHTML(block: Block): string {
  if (!block || !block.type) {
    return "";
  }

  const content = block.content || [];
  const props = block.props || {};

  switch (block.type) {
    case "paragraph":
      const paragraphContent = convertInlineContentToHTML(content);
      return `<p>${paragraphContent}</p>`;

    case "heading":
      const level = props.level || 1;
      const headingContent = convertInlineContentToHTML(content);
      return `<h${level}>${headingContent}</h${level}>`;

    case "bulletListItem":
      const bulletContent = convertInlineContentToHTML(content);
      const nestedBullets = block.children?.map(convertBlockToHTML).join("") || "";
      return `<li>${bulletContent}${nestedBullets ? `<ul>${nestedBullets}</ul>` : ""}</li>`;

    case "numberedListItem":
      const numberedContent = convertInlineContentToHTML(content);
      const nestedNumbered = block.children?.map(convertBlockToHTML).join("") || "";
      return `<li>${numberedContent}${nestedNumbered ? `<ol>${nestedNumbered}</ol>` : ""}</li>`;

    case "checkListItem":
      const checked = props.checked || false;
      const checkContent = convertInlineContentToHTML(content);
      return `<li><input type="checkbox" ${checked ? "checked" : ""} disabled> ${checkContent}</li>`;

    case "codeBlock":
      const language = props.language || "";
      const codeContent = convertInlineContentToHTML(content);
      return `<pre><code${language ? ` class="language-${language}"` : ""}>${codeContent}</code></pre>`;

    case "table":
      // Basic table support - BlockNote tables are complex
      return `<table><tbody>${block.children?.map(convertBlockToHTML).join("") || ""}</tbody></table>`;

    case "tableRow":
      return `<tr>${block.children?.map(convertBlockToHTML).join("") || ""}</tr>`;

    case "tableCell":
      const cellContent = convertInlineContentToHTML(content);
      return `<td>${cellContent}</td>`;

    case "image":
      const src = props.url || "";
      const alt = props.caption || "";
      const width = props.width ? ` width="${props.width}"` : "";
      return `<img src="${src}" alt="${alt}"${width}>`;

    default:
      // Fallback for unknown block types
      const fallbackContent = convertInlineContentToHTML(content);
      return `<div data-block-type="${block.type}">${fallbackContent}</div>`;
  }
}

/**
 * Converts inline content (styled text) to HTML
 */
function convertInlineContentToHTML(content: any[]): string {
  if (!Array.isArray(content)) {
    return "";
  }

  return content.map((item: any) => {
    if (typeof item === "string") {
      return escapeHTML(item);
    }

    if (item.type === "text") {
      let text = escapeHTML(item.text || "");
      
      // Apply text styles
      if (item.styles) {
        if (item.styles.bold) text = `<strong>${text}</strong>`;
        if (item.styles.italic) text = `<em>${text}</em>`;
        if (item.styles.underline) text = `<u>${text}</u>`;
        if (item.styles.strike) text = `<s>${text}</s>`;
        if (item.styles.code) text = `<code>${text}</code>`;
        if (item.styles.textColor) text = `<span style="color: ${item.styles.textColor}">${text}</span>`;
        if (item.styles.backgroundColor) text = `<span style="background-color: ${item.styles.backgroundColor}">${text}</span>`;
      }

      return text;
    }

    if (item.type === "link") {
      const href = item.href || "";
      const linkText = convertInlineContentToHTML(item.content || []);
      return `<a href="${escapeHTML(href)}">${linkText}</a>`;
    }

    // Fallback for unknown inline types
    return escapeHTML(String(item));
  }).join("");
}

/**
 * Escapes HTML special characters
 */
function escapeHTML(text: string): string {
  const div = { innerHTML: "" } as any;
  div.textContent = text;
  return div.innerHTML || text.replace(/[&<>"']/g, (match: string) => {
    const escapeMap: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return escapeMap[match];
  });
}

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
 * Generates an excerpt from BlockNote content
 */
export function generateExcerpt(content: any, maxLength: number = 160): string {
  try {
    const html = blockNoteToHTML(content);
    // Strip HTML tags and get plain text
    const plainText = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    // Truncate at word boundary
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + "..."
      : truncated + "...";
  } catch (error) {
    console.error("Error generating excerpt:", error);
    return "";
  }
}

/**
 * Validates BlockNote content structure
 */
export function validateBlockNoteContent(content: any): { isValid: boolean; error?: string } {
  try {
    if (!content) {
      return { isValid: false, error: "Content is required" };
    }

    if (typeof content !== "object") {
      return { isValid: false, error: "Content must be an object" };
    }

    if (!content.content || !Array.isArray(content.content)) {
      return { isValid: false, error: "Content must have a content array" };
    }

    // Basic validation of blocks
    for (const block of content.content) {
      if (!block || typeof block !== "object") {
        return { isValid: false, error: "Invalid block structure" };
      }

      if (!block.type || typeof block.type !== "string") {
        return { isValid: false, error: "Block must have a type" };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Invalid JSON structure" };
  }
}

/**
 * Validates changelog metadata
 */
export function validateChangelogMetadata(metadata: {
  title?: string;
  slug?: string;
  excerpt?: string;
  version?: string;
  tags?: string[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Title validation
  if (!metadata.title || typeof metadata.title !== "string") {
    errors.push("Title is required and must be a string");
  } else if (metadata.title.trim().length === 0) {
    errors.push("Title cannot be empty");
  } else if (metadata.title.length > 200) {
    errors.push("Title must be 200 characters or less");
  }

  // Slug validation
  if (!metadata.slug || typeof metadata.slug !== "string") {
    errors.push("Slug is required and must be a string");
  } else if (metadata.slug.trim().length === 0) {
    errors.push("Slug cannot be empty");
  } else if (!/^[a-z0-9-]+$/.test(metadata.slug)) {
    errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
  } else if (metadata.slug.length > 100) {
    errors.push("Slug must be 100 characters or less");
  }

  // Excerpt validation (optional)
  if (metadata.excerpt && typeof metadata.excerpt !== "string") {
    errors.push("Excerpt must be a string");
  } else if (metadata.excerpt && metadata.excerpt.length > 500) {
    errors.push("Excerpt must be 500 characters or less");
  }

  // Version validation (optional)
  if (metadata.version && typeof metadata.version !== "string") {
    errors.push("Version must be a string");
  } else if (metadata.version && metadata.version.length > 50) {
    errors.push("Version must be 50 characters or less");
  }

  // Tags validation (optional)
  if (metadata.tags) {
    if (!Array.isArray(metadata.tags)) {
      errors.push("Tags must be an array");
    } else {
      for (const tag of metadata.tags) {
        if (typeof tag !== "string") {
          errors.push("All tags must be strings");
          break;
        }
        if (tag.length > 50) {
          errors.push("Each tag must be 50 characters or less");
          break;
        }
      }
      if (metadata.tags.length > 10) {
        errors.push("Maximum 10 tags allowed");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Ensures slug uniqueness by appending a number if needed
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}