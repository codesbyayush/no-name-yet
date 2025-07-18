import { Block } from "@blocknote/core";

/**
 * Converts BlockNote JSON content to HTML string
 * @param content - BlockNote JSON content
 * @returns HTML string representation
 */
export function blockNoteToHTML(content: Block[]): string {
	if (!content || !Array.isArray(content)) {
		return "";
	}

	return content.map(blockToHTML).join("");
}

/**
 * Converts a single BlockNote block to HTML
 * @param block - BlockNote block
 * @returns HTML string for the block
 */
function blockToHTML(block: Block): string {
	if (!block || !block.type) {
		return "";
	}

	const { type, content = [], props = {} } = block;

	// Handle different block types
	switch (type) {
		case "paragraph":
			return `<p>${inlineContentToHTML(content)}</p>`;

		case "heading":
			const level = props.level || 1;
			return `<h${level}>${inlineContentToHTML(content)}</h${level}>`;

		case "bulletListItem":
			return `<li>${inlineContentToHTML(content)}</li>`;

		case "numberedListItem":
			return `<li>${inlineContentToHTML(content)}</li>`;

		case "checkListItem":
			const checked = props.checked ? 'checked' : '';
			return `<li><input type="checkbox" ${checked} disabled> ${inlineContentToHTML(content)}</li>`;

		case "codeBlock":
			const language = props.language || '';
			return `<pre><code class="language-${language}">${escapeHTML(contentToPlainText(content))}</code></pre>`;

		case "table":
			return tableToHTML(block);

		case "image":
			const src = props.url || '';
			const alt = props.caption || '';
			const width = props.width ? `width="${props.width}"` : '';
			return `<img src="${src}" alt="${alt}" ${width} />`;

		case "video":
			const videoSrc = props.url || '';
			return `<video controls><source src="${videoSrc}"></video>`;

		case "audio":
			const audioSrc = props.url || '';
			return `<audio controls><source src="${audioSrc}"></audio>`;

		case "file":
			const fileUrl = props.url || '';
			const fileName = props.name || 'Download';
			return `<a href="${fileUrl}" download>${fileName}</a>`;

		default:
			// Fallback for unknown block types
			return `<div data-block-type="${type}">${inlineContentToHTML(content)}</div>`;
	}
}

/**
 * Converts inline content (styled text) to HTML
 * @param content - Array of inline content
 * @returns HTML string
 */
function inlineContentToHTML(content: any[]): string {
	if (!content || !Array.isArray(content)) {
		return "";
	}

	return content.map((item) => {
		if (typeof item === "string") {
			return escapeHTML(item);
		}

		if (item.type === "text") {
			let text = escapeHTML(item.text || "");
			const styles = item.styles || {};

			// Apply text formatting
			if (styles.bold) text = `<strong>${text}</strong>`;
			if (styles.italic) text = `<em>${text}</em>`;
			if (styles.underline) text = `<u>${text}</u>`;
			if (styles.strike) text = `<s>${text}</s>`;
			if (styles.code) text = `<code>${text}</code>`;

			// Apply text color
			if (styles.textColor && styles.textColor !== "default") {
				text = `<span style="color: ${styles.textColor}">${text}</span>`;
			}

			// Apply background color
			if (styles.backgroundColor && styles.backgroundColor !== "default") {
				text = `<span style="background-color: ${styles.backgroundColor}">${text}</span>`;
			}

			return text;
		}

		if (item.type === "link") {
			const href = item.href || "";
			const linkText = inlineContentToHTML(item.content || []);
			return `<a href="${href}">${linkText}</a>`;
		}

		return "";
	}).join("");
}

/**
 * Converts table block to HTML
 * @param block - Table block
 * @returns HTML table string
 */
function tableToHTML(block: Block): string {
	const content = block.content;
	if (!content || !Array.isArray(content)) {
		return "<table></table>";
	}

	const rows = content.map((row: any) => {
		if (!row.content || !Array.isArray(row.content)) {
			return "<tr></tr>";
		}

		const cells = row.content.map((cell: any) => {
			const cellContent = inlineContentToHTML(cell.content || []);
			return `<td>${cellContent}</td>`;
		}).join("");

		return `<tr>${cells}</tr>`;
	}).join("");

	return `<table>${rows}</table>`;
}

/**
 * Converts content to plain text (for code blocks, etc.)
 * @param content - Content array
 * @returns Plain text string
 */
function contentToPlainText(content: any[]): string {
	if (!content || !Array.isArray(content)) {
		return "";
	}

	return content.map((item) => {
		if (typeof item === "string") {
			return item;
		}
		if (item.type === "text") {
			return item.text || "";
		}
		return "";
	}).join("");
}

/**
 * Escapes HTML special characters
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
function escapeHTML(text: string): string {
	const div = { innerHTML: text } as any;
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Validates BlockNote content structure
 * @param content - Content to validate
 * @returns Boolean indicating if content is valid
 */
export function validateBlockNoteContent(content: any): boolean {
	if (!content) {
		return false;
	}

	// Should be an array of blocks
	if (!Array.isArray(content)) {
		return false;
	}

	// Each block should have a type
	return content.every((block) => {
		return block && typeof block === "object" && typeof block.type === "string";
	});
}

/**
 * Generates a URL-friendly slug from text
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generates an excerpt from BlockNote content
 * @param content - BlockNote content
 * @param maxLength - Maximum length of excerpt (default: 160)
 * @returns Excerpt string
 */
export function generateExcerpt(content: Block[], maxLength: number = 160): string {
	if (!content || !Array.isArray(content)) {
		return "";
	}

	// Extract plain text from all blocks
	const plainText = content
		.map((block) => {
			if (block.content) {
				return contentToPlainText(block.content);
			}
			return "";
		})
		.join(" ")
		.trim();

	// Truncate to maxLength
	if (plainText.length <= maxLength) {
		return plainText;
	}

	// Find the last complete word within the limit
	const truncated = plainText.substring(0, maxLength);
	const lastSpaceIndex = truncated.lastIndexOf(" ");

	if (lastSpaceIndex > 0) {
		return truncated.substring(0, lastSpaceIndex) + "...";
	}

	return truncated + "...";
}