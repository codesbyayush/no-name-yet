import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/public/board/")({
  component: BoardIndexPage,
});

function BoardIndexPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to the Board</h2>
        <p className="text-muted-foreground">
          Select a category above to browse features, report bugs, or share feedback
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold">Features</h3>
          <p className="text-sm text-muted-foreground">
            Explore new features and request enhancements
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.667-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold">Bug Reports</h3>
          <p className="text-sm text-muted-foreground">
            Report issues and track bug fixes
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold">Feedback</h3>
          <p className="text-sm text-muted-foreground">
            Share your thoughts and suggestions
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-6">
        <h3 className="mb-3 text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>New feature request: Dark mode improvements</span>
            <span className="text-muted-foreground">2 hours ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>Bug report: Login form validation issue</span>
            <span className="text-muted-foreground">4 hours ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Feedback: Great user experience overall</span>
            <span className="text-muted-foreground">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
