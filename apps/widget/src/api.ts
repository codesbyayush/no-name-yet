/**
 * Configuration options for creating an API client
 */
interface ApiClientOptions {
  /** Base URL of the API server */
  apiUrl: string;
  /** Public API key for authentication */
  publicKey: string;
}

/**
 * Represents a feedback board
 * Boards are used to categorize feedback submissions
 */
export interface Board {
  /** Unique board identifier */
  id: string;
  /** Display name of the board */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Optional board description */
  description: string | null;
  /** Number of posts in this board */
  postCount: number;
}

/**
 * Feedback submission payload
 * Contains all information needed to create a new feedback post
 */
export interface FeedbackSubmission {
  /** ID of the board to submit to */
  boardId: string;
  /** Type of feedback */
  type: 'bug' | 'suggestion';
  /** Feedback description (can include title + description combined) */
  description: string;
  /** Optional user information for attribution */
  user?: {
    /** User ID from your system */
    id?: string;
    /** User's display name */
    name?: string;
    /** User's email address */
    email?: string;
  };
  /** Custom metadata to attach to the submission */
  customData?: { [key: string]: string };
  /** Browser/environment information for debugging */
  browserInfo: {
    /** User agent string */
    userAgent: string;
    /** Current page URL */
    url: string;
    /** Operating system platform */
    platform?: string;
    /** Browser language */
    language?: string;
    /** Whether cookies are enabled */
    cookieEnabled?: boolean;
    /** Whether browser is online */
    onLine?: boolean;
    /** Screen resolution (e.g., "1920x1080") */
    screenResolution?: string;
  };
  // attachments metadata might be added here later
}

/**
 * In-memory cache for board data
 * Key format: "apiUrl|publicKey"
 * Cached for the lifetime of the page to reduce API calls
 */
const boardsCache = new Map<string, Promise<Board[]>>();

/**
 * Handles API response and error parsing
 *
 * Attempts to parse error messages from the response body,
 * falling back to status text if parsing fails.
 *
 * @param response - Fetch API response object
 * @returns Parsed JSON response
 * @throws Error with message from API or status text
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let error: Error | undefined;
    try {
      const errorBody = await response.json();
      error = new Error(
        errorBody.message || `API Error: ${response.statusText}`,
      );
    } catch {
      error = new Error(`API Error: ${response.statusText}`);
    }
    throw error;
  }
  return response.json() as Promise<T>;
};

/**
 * Creates an API client for the widget
 *
 * The client provides methods for:
 * - Fetching public boards
 * - Fetching tags
 * - Submitting feedback
 *
 * All requests include the public key in the X-Public-Key header.
 *
 * @param options - API client configuration
 * @returns API client with methods for making requests
 *
 * @example
 * ```typescript
 * const client = createApiClient({
 *   apiUrl: 'https://api.example.com',
 *   publicKey: 'pk_123456'
 * });
 *
 * const boards = await client.getPublicBoards();
 * ```
 */
export const createApiClient = ({ apiUrl, publicKey }: ApiClientOptions) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Public-Key': publicKey,
  };

  const baseUrl = `${apiUrl}/api/v1/public`;

  return {
    /**
     * Fetches the list of public boards for the organization.
     */
    getPublicBoards: (): Promise<Board[]> =>
      fetch(`${baseUrl}/boards`, {
        method: 'GET',
        headers,
      }).then((res) => handleResponse<Board[]>(res)),

    /**
     * Cached version of getPublicBoards. Cached per (apiUrl|publicKey) for this tab lifetime.
     */
    getPublicBoardsCached: (): Promise<Board[]> => {
      const cacheKey = `${baseUrl}|${publicKey}`;
      const existing = boardsCache.get(cacheKey);
      if (existing) {
        return existing;
      }
      const promise = fetch(`${baseUrl}/boards`, {
        method: 'GET',
        headers,
      })
        .then((res) => handleResponse<Board[]>(res))
        .catch((err) => {
          boardsCache.delete(cacheKey);
          throw err;
        });
      boardsCache.set(cacheKey, promise);
      return promise;
    },

    /**
     * Fetches the list of unique tags for the organization.
     */
    getTags: (): Promise<string[]> =>
      fetch(`${baseUrl}/tags`, {
        method: 'GET',
        headers,
      }).then((res) => handleResponse<string[]>(res)),

    /**
     * Submits new feedback.
     * Note: This endpoint needs to be created on the server.
     */
    submitFeedback: (
      payload: FeedbackSubmission,
    ): Promise<{ success: boolean; feedbackId: string }> =>
      fetch(`${baseUrl}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }).then((res) =>
        handleResponse<{ success: boolean; feedbackId: string }>(res),
      ),
  };
};

export type ApiClient = ReturnType<typeof createApiClient>;
