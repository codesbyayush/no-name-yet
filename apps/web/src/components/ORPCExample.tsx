import React, { useState } from "react";
import {
	getOrpcErrorMessage,
	useAuthStatus,
	useCreatePrivateNote,
	useCurrentUserTrigger,
	useEcho,
	useHealthCheckTrigger,
	useOrpcBatch,
} from "../lib/api/hooks/orpc";

export function ORPCExample() {
	const [message, setMessage] = useState("Hello from oRPC!");
	const [noteTitle, setNoteTitle] = useState("Test Note");
	const [noteContent, setNoteContent] = useState(
		"This is a test note created via oRPC",
	);

	// Use the new hooks
	const triggerHealthCheck = useHealthCheckTrigger();
	const triggerCurrentUser = useCurrentUserTrigger();
	const echoMutation = useEcho();
	const createNoteMutation = useCreatePrivateNote();
	const { user, isAuthenticated, isLoading: authLoading } = useAuthStatus();
	const { invalidateAll, refetchAll, clearAll } = useOrpcBatch();

	// State for results and loading
	const [healthResult, setHealthResult] = useState<any>(null);
	const [userResult, setUserResult] = useState<any>(null);
	const [healthLoading, setHealthLoading] = useState(false);
	const [userLoading, setUserLoading] = useState(false);

	const handleHealthCheck = async () => {
		setHealthLoading(true);
		try {
			const result = await triggerHealthCheck();
			setHealthResult(result);
		} catch (error) {
			console.error("Health check failed:", error);
			setHealthResult({ error: getOrpcErrorMessage(error) });
		} finally {
			setHealthLoading(false);
		}
	};

	const handleGetCurrentUser = async () => {
		setUserLoading(true);
		try {
			const result = await triggerCurrentUser();
			setUserResult(result);
		} catch (error) {
			console.error("Get current user failed:", error);
			setUserResult({ error: getOrpcErrorMessage(error) });
		} finally {
			setUserLoading(false);
		}
	};

	const handleEcho = () => {
		echoMutation.mutate(message);
	};

	const handleCreateNote = () => {
		createNoteMutation.mutate({
			title: noteTitle,
			content: noteContent,
		});
	};

	const isLoading =
		healthLoading ||
		userLoading ||
		echoMutation.isPending ||
		createNoteMutation.isPending;

	const latestResult =
		echoMutation.data || createNoteMutation.data || healthResult || userResult;
	const latestError =
		echoMutation.error ||
		createNoteMutation.error ||
		(healthResult?.error ? new Error(healthResult.error) : null) ||
		(userResult?.error ? new Error(userResult.error) : null);

	return (
		<div className="mx-auto max-w-4xl p-6">
			<h2 className="mb-6 font-bold text-2xl">oRPC Integration Example</h2>
			<p className="mb-6 text-gray-600 dark:text-gray-400">
				This example demonstrates oRPC with TanStack Query integration for
				type-safe API calls using custom hooks.
			</p>

			{/* Auth Status */}
			<div className="mb-6 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
				<h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
					Authentication Status
				</h3>
				{authLoading ? (
					<p className="text-blue-600 dark:text-blue-400">
						Checking authentication...
					</p>
				) : isAuthenticated ? (
					<div className="text-green-600 dark:text-green-400">
						<p>
							✅ Authenticated as: {user?.name || user?.email || "Unknown User"}
						</p>
						<p className="text-sm">User ID: {user?.id}</p>
					</div>
				) : (
					<p className="text-red-600 dark:text-red-400">❌ Not authenticated</p>
				)}
			</div>

			{/* Input Fields */}
			<div className="mb-6 grid gap-4 space-y-4 md:grid-cols-2">
				<div>
					<label htmlFor="message" className="mb-2 block font-medium text-sm">
						Echo Message:
					</label>
					<input
						id="message"
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
						placeholder="Enter a message"
					/>
				</div>

				<div>
					<label htmlFor="noteTitle" className="mb-2 block font-medium text-sm">
						Note Title:
					</label>
					<input
						id="noteTitle"
						type="text"
						value={noteTitle}
						onChange={(e) => setNoteTitle(e.target.value)}
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
						placeholder="Note title"
					/>
				</div>

				<div className="md:col-span-2">
					<label
						htmlFor="noteContent"
						className="mb-2 block font-medium text-sm"
					>
						Note Content:
					</label>
					<textarea
						id="noteContent"
						value={noteContent}
						onChange={(e) => setNoteContent(e.target.value)}
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
						placeholder="Note content"
						rows={3}
					/>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
				<button
					onClick={handleHealthCheck}
					disabled={isLoading}
					className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{healthLoading ? "Checking..." : "Health Check"}
				</button>

				<button
					onClick={handleEcho}
					disabled={isLoading || !message.trim()}
					className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{echoMutation.isPending ? "Echoing..." : "Echo Test"}
				</button>

				<button
					onClick={handleGetCurrentUser}
					disabled={isLoading}
					className="rounded bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{userLoading ? "Loading..." : "Get User"}
				</button>

				<button
					onClick={handleCreateNote}
					disabled={isLoading || !noteTitle.trim() || !noteContent.trim()}
					className="rounded bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{createNoteMutation.isPending ? "Creating..." : "Create Note"}
				</button>
			</div>

			{/* Cache Management */}
			<div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
				<h3 className="mb-3 font-semibold">Cache Management</h3>
				<div className="flex flex-wrap gap-2">
					<button
						onClick={invalidateAll}
						className="rounded bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
					>
						Invalidate All
					</button>
					<button
						onClick={refetchAll}
						className="rounded bg-indigo-500 px-3 py-1 text-sm text-white hover:bg-indigo-600"
					>
						Refetch All
					</button>
					<button
						onClick={clearAll}
						className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
					>
						Clear All
					</button>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="mb-4 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
					<p className="flex items-center text-blue-600 dark:text-blue-400">
						<svg
							className="-ml-1 mr-3 h-5 w-5 animate-spin text-blue-600"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Processing request...
					</p>
				</div>
			)}

			{/* Error State */}
			{latestError && (
				<div className="mb-4 rounded border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
					<h4 className="mb-2 font-semibold text-red-800 dark:text-red-200">
						Error
					</h4>
					<p className="text-red-600 dark:text-red-400">
						{getOrpcErrorMessage(latestError)}
					</p>
				</div>
			)}

			{/* Success State */}
			{latestResult && !latestError && (
				<div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-2 font-semibold">Latest Result:</h3>
					<pre className="max-h-96 overflow-auto rounded border bg-white p-3 text-sm dark:bg-gray-900">
						{JSON.stringify(latestResult, null, 2)}
					</pre>
				</div>
			)}

			{/* Mutation Status */}
			<div className="mb-6 grid gap-4 md:grid-cols-2">
				{echoMutation.data && (
					<div className="rounded border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
						<h4 className="mb-1 font-semibold text-blue-800 dark:text-blue-200">
							Echo Result
						</h4>
						<p className="text-blue-600 text-sm dark:text-blue-400">
							{echoMutation.data.echo}
						</p>
						<p className="text-blue-500 text-xs dark:text-blue-500">
							Timestamp: {echoMutation.data.timestamp}
						</p>
					</div>
				)}

				{createNoteMutation.data && (
					<div className="rounded border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
						<h4 className="mb-1 font-semibold text-green-800 dark:text-green-200">
							Note Created
						</h4>
						<p className="text-green-600 text-sm dark:text-green-400">
							{createNoteMutation.data.title}
						</p>
						<p className="text-green-500 text-xs dark:text-green-500">
							ID: {createNoteMutation.data.id}
						</p>
					</div>
				)}
			</div>

			{/* Usage Notes */}
			<div className="rounded border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
				<h4 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
					oRPC Integration Features:
				</h4>
				<ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
					<li>• ✅ Type-safe API calls with full TypeScript support</li>
					<li>
						• ✅ Integration with TanStack Query for caching and synchronization
					</li>
					<li>• ✅ Custom hooks following your existing API patterns</li>
					<li>• ✅ Automatic authentication status detection</li>
					<li>• ✅ Error handling with proper error messages</li>
					<li>• ✅ Cache management utilities (invalidate, refetch, clear)</li>
					<li>• ✅ Loading states and optimistic updates</li>
					<li>• ✅ Public endpoints (Health Check, Echo) work without auth</li>
					<li>
						• ✅ Protected endpoints (Get User, Create Note) require
						authentication
					</li>
				</ul>
			</div>
		</div>
	);
}
