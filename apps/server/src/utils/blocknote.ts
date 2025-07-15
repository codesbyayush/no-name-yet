import { type Block } from "@blocknote/core";

/**
 * Converts BlockNote JSON content to HTML string
 * This is a server-side utility for generating HTML from BlockNote content
 */
export async function blockNoteToHTML(content: Block[]): Promise<string> {
  if (!content || !Array.isArray(content)) {
    return "";
  }

  try {
    const htmlBlocks = content.map(blockToHTML).filter(Boolean);
    return htmlBlocks.join("\n");
  } catch (error) {
    console.error("Error converting BlockNote to HTML:", error);
    throw new Error("Failed to convert BlockNote content to HTML");
  }
}

/**
 * Converts a single BlockNote block to HTML
 */
function blockToHTML(block: Block): string {
  if (!block || !block.type) {
    return "";
  }

  const { type, content, props, children } = block;

  // Handle different block types
  switch (type) {
    case "paragraph":
      return `<p>${inlineContentToHTML(content)}</p>`;

    case "heading":
      const level = props?.level || 1;
      return `<h${level}>${inlineContentToHTML(content)}</h${level}>`;

    case "bulletListItem":
      const childrenHTML = children?.map(blockToHTML).join("") || "";
      return `<li>${inlineContentToHTML(content)}${childrenHTML ? `<ul>${childrenHTML}</ul>` : ""}</li>`;

    case "numberedListItem":
      const numberedChildrenHTML = children?.map(blockToHTML).join("") || "";
      return `<li>${inlineContentToHTML(content)}${numberedChildrenHTML ? `<ol>${numberedChildrenHTML}</ol>` : ""}</li>`;

    case "checkListItem":
      const checked = props?.checked ? "checked" : "";
      const checkChildrenHTML = children?.map(blockToHTML).join("") || "";
      return `<li><input type="checkbox" ${checked} disabled> ${inlineContentToHTML(content)}${checkChildrenHTML ? `<ul>${checkChildrenHTML}</ul>` : ""}</li>`;

    case "table":
      const tableContent = children?.map(rowToHTML).join("") || "";
      return `<table><tbody>${tableContent}</tbody></table>`;

    case "tableRow":
      const rowContent = children?.map(cellToHTML).join("") || "";
      return `<tr>${rowContent}</tr>`;

    case "tableCell":
      return `<td>${inlineContentToHTML(content)}</td>`;

    case "codeBlock":
      const language = props?.language || "";
      return `<pre><code class="language-${language}">${escapeHTML(content?.[0]?.text || "")}</code></pre>`;

    case "image":
      const src = props?.url || "";
      const alt = props?.caption || "";
      const width = props?.width ? `width="${props.width}"` : "";
      return `<img src="${src}" alt="${alt}" ${width} />`;

    case "video":
      const videoSrc = props?.url || "";
      return `<video controls><source src="${videoSrc}" /></video>`;

    case "audio":
      const audioSrc = props?.url || "";
      return `<audio controls><source src="${audioSrc}" /></audio>`;

    case "file":
      const fileUrl = props?.url || "";
      const fileName = props?.name || "Download";
      return `<a href="${fileUrl}" download>${fileName}</a>`;

    default:
      // For unknown block types, try to render content as paragraph
      if (content) {
        return `<p>${inlineContentToHTML(content)}</p>`;
      }
      return "";
  }
}

/**
 * Converts table row block to HTML
 */
function rowToHTML(block: Block): string {
  if (block.type === "tableRow" && block.children) {
    const cells = block.children.map(cellToHTML).join("");
    return `<tr>${cells}</tr>`;
  }
  return "";
}

/**
 * Converts table cell block to HTML
 */
function cellToHTML(block: Block): string {
  if (block.type === "tableCell") {
    return `<td>${inlineContentToHTML(block.content)}</td>`;
  }
  return "";
}

/**
 * Converts inline content (styled text) to HTML
 */
function inlineContentToHTML(content: any[]): string {
  if (!content || !Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (typeof item === "string") {
        return escapeHTML(item);
      }

      if (item.type === "text") {
        let text = escapeHTML(item.text || "");
        
        // Apply styles
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
        const linkText = escapeHTML(item.content || "");
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      }

      return "";
    })
    .join("");
}

/**
 * Escapes HTML special characters
 */
function escapeHTML(text: string): string {
  if (typeof text !== "string") return "";
  
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates BlockNote content structure
 */
export function validateBlockNoteContent(content: any): boolean {
  if (!content) return false;
  if (!Array.isArray(content)) return false;
  
  // Check if all items are valid blocks
  return content.every((block) => {
    return (
      typeof block === "object" &&
      block !== null &&
      typeof block.type === "string" &&
      block.type.length > 0
    );
  });
}

/**
 * Generates excerpt from BlockNote content
 */
export function generateExcerpt(content: Block[], maxLength: number = 200): string {
  if (!content || !Array.isArray(content)) {
    return "";
  }

  // Extract plain text from all blocks
  const plainText = content
    .map(extractPlainTextFromBlock)
    .filter(Boolean)
    .join(" ");

  // Truncate to maxLength
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last space before maxLength to avoid cutting words
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

/**
 * Extracts plain text from a BlockNote block
 */
function extractPlainTextFromBlock(block: Block): string {
  if (!block || !block.content) return "";

  if (Array.isArray(block.content)) {
    return block.content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item.type === "text") return item.text || "";
        if (item.type === "link") return item.content || "";
        return "";
      })
      .join("");
  }

  return "";
}