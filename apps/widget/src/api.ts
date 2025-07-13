interface ApiClientOptions {
	apiUrl: string;
	publicKey: string;
}

export interface Board {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	postCount: number;
}

export interface FeedbackSubmission {
	boardId: string;
	type: "bug" | "suggestion";
	description: string;
	severity?: "low" | "medium" | "high" | "critical";
	user?: {
		id?: string;
		name?: string;
		email?: string;
	};
	customData?: { [key: string]: string };
	browserInfo: {
		userAgent: string;
		url: string;
		platform?: string;
		language?: string;
		cookieEnabled?: boolean;
		onLine?: boolean;
		screenResolution?: string;
	};
	// attachments metadata might be added here later
}

const handleResponse = async <T>(response: Response): Promise<T> => {
	if (!response.ok) {
		let error;
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

export const createApiClient = ({ apiUrl, publicKey }: ApiClientOptions) => {
	const headers = {
		"Content-Type": "application/json",
		"X-Public-Key": publicKey,
	};

	const baseUrl = `${apiUrl}/api/v1/public`;

	return {
		/**
		 * Fetches the list of public boards for the organization.
		 */
		getPublicBoards: (): Promise<Board[]> => {
			return fetch(`${baseUrl}/boards`, {
				method: "GET",
				headers,
			}).then((res) => handleResponse<Board[]>(res));
		},

		/**
		 * Fetches the list of unique tags for the organization.
		 */
		getTags: (): Promise<string[]> => {
			return fetch(`${baseUrl}/tags`, {
				method: "GET",
				headers,
			}).then((res) => handleResponse<string[]>(res));
		},

		/**
		 * Submits new feedback.
		 * Note: This endpoint needs to be created on the server.
		 */
		submitFeedback: (
			payload: FeedbackSubmission,
		): Promise<{ success: boolean; feedbackId: string }> => {
			return fetch(`${baseUrl}/feedback`, {
				method: "POST",
				headers,
				body: JSON.stringify(payload),
			}).then((res) =>
				handleResponse<{ success: boolean; feedbackId: string }>(res),
			);
		},
	};
};

export type ApiClient = ReturnType<typeof createApiClient>;
