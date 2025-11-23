import { REGEX } from '../constants';

/**
 * Removes trailing slash from a URL
 *
 * This is used when constructing iframe URLs to ensure consistent formatting.
 * For example: "https://example.com/" becomes "https://example.com"
 *
 * @param url - The URL to process
 * @returns URL without trailing slash
 *
 * @example
 * ```typescript
 * removeTrailingSlash('https://example.com/') // 'https://example.com'
 * removeTrailingSlash('https://example.com')  // 'https://example.com'
 * ```
 */
export const removeTrailingSlash = (url: string): string => {
  return url.replace(REGEX.TRAILING_SLASH, '');
};
