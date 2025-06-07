import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/public/board/bugs")({
  component: BugsPage,
});

function BugsPage() {
  const bugs = [
    {
      id: 1,
      title: "Login form validation not working properly",
      description: "When submitting the login form with invalid credentials, no error message is displayed",
      status: "Open",
      severity: "High",
      priority: "High",
      reproduced: true,
      author: "user123",
      assignee: "dev-team",
      createdAt: "2024-01-12",
      steps: [
        "Navigate to login page",
        "Enter invalid email format",
        "Click submit button",
        "No validation error appears"
      ]
    },
    {
      id: 2,
      title: "Dashboard charts not loading on mobile",
      description: "Analytics charts fail to render correctly on mobile devices with screen width < 768px",
      status: "In Progress",
      severity: "Medium",
      priority: "Medium",
      reproduced: true,
      author: "user456",
      assignee: "dev-john",
      createdAt: "2024-01-10",
      steps: [
        "Open dashboard on mobile device",
        "Navigate to analytics section",
        "Charts show loading spinner indefinitely"
      ]
    },
    {
      id: 3,
      title: "Export functionality crashes with large datasets",
      description: "Application crashes when trying to export more than 10,000 records to CSV",
      status: "Under Investigation",
      severity: "Critical",
      priority: "High",
      reproduced: false,
      author: "user789",
      assignee: "dev-sarah",
      createdAt: "2024-01-08",
      steps: [
        "Go to data export page",
        "Select 'All records' option",
        "Click export CSV",
        "Browser tab crashes"
      ]
    },
    {
      id: 4,
      title: "Search results pagination broken",
      description: "Clicking on page 2 and beyond in search results shows no data",
      status: "Fixed",
      severity: "Low",
      priority: "Medium",
      reproduced: true,
      author: "user321",
      assignee: "dev-mike",
      createdAt: "2024-01-05",
      steps: [
        "Perform any search query",
        "Navigate to page 2 of results",
        "Page shows 'No results found'"
      ]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Fixed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Under Investigation":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-600 dark:text-red-400 font-bold";
      case "High":
        return "text-red-600 dark:text-red-400";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "Low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "High":
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.667-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case "Medium":
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bug Reports</h2>
          <p className="text-muted-foreground">
            Track and manage reported issues and bugs
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Report Bug
        </button>
      </div>

      <div className="flex gap-4">
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="under-investigation">Under Investigation</option>
          <option value="fixed">Fixed</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Sort by</option>
          <option value="severity">Severity</option>
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="space-y-4">
        {bugs.map((bug) => (
          <div key={bug.id} className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${getSeverityColor(bug.severity)}`}>
                      {getSeverityIcon(bug.severity)}
                      <span className="text-sm font-medium">{bug.severity}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        bug.status
                      )}`}
                    >
                      {bug.status}
                    </span>
                    {bug.reproduced && (
                      <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                        Reproduced
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{bug.title}</h3>
                  <p className="text-muted-foreground">{bug.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by {bug.author}</span>
                    <span>•</span>
                    <span>assigned to {bug.assignee}</span>
                    <span>•</span>
                    <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">Steps to Reproduce:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {bug.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                  👍 Upvote
                </button>
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                  💬 Comment
                </button>
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                  🔄 Subscribe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
