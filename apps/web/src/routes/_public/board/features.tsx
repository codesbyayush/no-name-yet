import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/board/features")({
  component: FeaturesPage,
});

function FeaturesPage() {
  const features = [
    {
      id: 1,
      title: "Advanced Search Filters",
      description: "Add more granular search options with custom filters and sorting capabilities",
      status: "In Progress",
      votes: 24,
      category: "Enhancement",
      priority: "High",
      author: "user123",
      createdAt: "2024-01-10",
    },
    {
      id: 2,
      title: "Bulk Operations",
      description: "Allow users to perform actions on multiple items at once",
      status: "Planned",
      votes: 18,
      category: "Feature",
      priority: "Medium",
      author: "admin",
      createdAt: "2024-01-08",
    },
    {
      id: 3,
      title: "Real-time Collaboration",
      description: "Enable multiple users to work on the same document simultaneously",
      status: "Under Review",
      votes: 35,
      category: "Feature",
      priority: "High",
      author: "user456",
      createdAt: "2024-01-05",
    },
    {
      id: 4,
      title: "Export to PDF",
      description: "Add functionality to export reports and data as PDF files",
      status: "Completed",
      votes: 12,
      category: "Enhancement",
      priority: "Low",
      author: "user789",
      createdAt: "2023-12-28",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Planned":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Under Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Feature Requests</h2>
          <p className="text-muted-foreground">
            Browse and vote on feature requests from the community
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + New Feature Request
        </button>
      </div>

      <div className="flex gap-4">
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="under-review">Under Review</option>
          <option value="completed">Completed</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Sort by</option>
          <option value="votes">Most Votes</option>
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.id} className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      feature.status
                    )}`}
                  >
                    {feature.status}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(feature.priority)}`}>
                    {feature.priority} Priority
                  </span>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>by {feature.author}</span>
                  <span>•</span>
                  <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="rounded bg-secondary px-2 py-1 text-xs">
                    {feature.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="flex flex-col items-center gap-1 rounded-md border px-3 py-2 hover:bg-muted">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span className="text-sm font-medium">{feature.votes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
