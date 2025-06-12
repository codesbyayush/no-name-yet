import React, { useState } from "react";
import {
  useHealthCheckTrigger,
  useCurrentUserTrigger,
  useEcho,
  useCreatePrivateNote,
  useAuthStatus,
  useOrpcBatch,
  getOrpcErrorMessage,
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
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">oRPC Integration Example</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This example demonstrates oRPC with TanStack Query integration for
        type-safe API calls using custom hooks.
      </p>

      {/* Auth Status */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
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
      <div className="space-y-4 mb-6 grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Echo Message:
          </label>
          <input
            id="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            placeholder="Enter a message"
          />
        </div>

        <div>
          <label htmlFor="noteTitle" className="block text-sm font-medium mb-2">
            Note Title:
          </label>
          <input
            id="noteTitle"
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            placeholder="Note title"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="noteContent"
            className="block text-sm font-medium mb-2"
          >
            Note Content:
          </label>
          <textarea
            id="noteContent"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            placeholder="Note content"
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <button
          onClick={handleHealthCheck}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {healthLoading ? "Checking..." : "Health Check"}
        </button>

        <button
          onClick={handleEcho}
          disabled={isLoading || !message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {echoMutation.isPending ? "Echoing..." : "Echo Test"}
        </button>

        <button
          onClick={handleGetCurrentUser}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {userLoading ? "Loading..." : "Get User"}
        </button>

        <button
          onClick={handleCreateNote}
          disabled={isLoading || !noteTitle.trim() || !noteContent.trim()}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {createNoteMutation.isPending ? "Creating..." : "Create Note"}
        </button>
      </div>

      {/* Cache Management */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
        <h3 className="font-semibold mb-3">Cache Management</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={invalidateAll}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Invalidate All
          </button>
          <button
            onClick={refetchAll}
            className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Refetch All
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <p className="text-blue-600 dark:text-blue-400 flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
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
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            Error
          </h4>
          <p className="text-red-600 dark:text-red-400">
            {getOrpcErrorMessage(latestError)}
          </p>
        </div>
      )}

      {/* Success State */}
      {latestResult && !latestError && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <h3 className="font-semibold mb-2">Latest Result:</h3>
          <pre className="text-sm overflow-auto bg-white dark:bg-gray-900 p-3 rounded border max-h-96">
            {JSON.stringify(latestResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Mutation Status */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {echoMutation.data && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Echo Result
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {echoMutation.data.echo}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-500">
              Timestamp: {echoMutation.data.timestamp}
            </p>
          </div>
        )}

        {createNoteMutation.data && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
              Note Created
            </h4>
            <p className="text-sm text-green-600 dark:text-green-400">
              {createNoteMutation.data.title}
            </p>
            <p className="text-xs text-green-500 dark:text-green-500">
              ID: {createNoteMutation.data.id}
            </p>
          </div>
        )}
      </div>

      {/* Usage Notes */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          oRPC Integration Features:
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
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
