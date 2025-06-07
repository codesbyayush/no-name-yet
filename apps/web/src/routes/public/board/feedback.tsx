import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/public/board/feedback")({
  component: FeedbackPage,
});

function FeedbackPage() {
  const feedbackItems = [
    {
      id: 1,
      title: "Amazing user experience!",
      content: "I love how intuitive and clean the interface is. The navigation is smooth and everything feels well thought out.",
      type: "Praise",
      category: "UI/UX",
      author: "user123",
      createdAt: "2024-01-15",
      votes: 28,
      helpful: true,
      tags: ["interface", "navigation", "design"]
    },
    {
      id: 2,
      title: "Suggestion: Add keyboard shortcuts",
      content: "It would be great to have keyboard shortcuts for common actions like creating new items, searching, etc. This would really speed up the workflow.",
      type: "Suggestion",
      category: "Productivity",
      author: "poweruser456",
      createdAt: "2024-01-14",
      votes: 15,
      helpful: false,
      tags: ["shortcuts", "productivity", "workflow"]
    },
    {
      id: 3,
      title: "Performance could be better",
      content: "The app sometimes feels slow when loading large datasets. Maybe consider pagination or virtual scrolling for better performance.",
      type: "Improvement",
      category: "Performance",
      author: "user789",
      createdAt: "2024-01-12",
      votes: 22,
      helpful: true,
      tags: ["performance", "loading", "datasets"]
    },
    {
      id: 4,
      title: "Love the dark mode!",
      content: "The dark mode implementation is perfect. Easy on the eyes and all the colors work well together. Thank you for this feature!",
      type: "Praise",
      category: "UI/UX",
      author: "nightowl",
      createdAt: "2024-01-10",
      votes: 34,
      helpful: true,
      tags: ["dark-mode", "design", "accessibility"]
    },
    {
      id: 5,
      title: "Mobile app would be fantastic",
      content: "While the web app works on mobile, a dedicated mobile app would provide a much better experience with native features and offline capabilities.",
      type: "Request",
      category: "Platform",
      author: "mobileuser",
      createdAt: "2024-01-08",
      votes: 41,
      helpful: false,
      tags: ["mobile", "app", "offline"]
    },
    {
      id: 6,
      title: "Integration with third-party tools",
      content: "It would be really helpful to have integrations with tools like Slack, Teams, and Jira for better workflow integration.",
      type: "Request",
      category: "Integration",
      author: "teamlead",
      createdAt: "2024-01-05",
      votes: 19,
      helpful: true,
      tags: ["integration", "slack", "teams", "jira"]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Praise":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Suggestion":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Improvement":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Request":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Praise":
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case "Suggestion":
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "Improvement":
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "Request":
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Feedback</h2>
          <p className="text-muted-foreground">
            Share your thoughts, suggestions, and experiences with our platform
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Share Feedback
        </button>
      </div>

      <div className="flex gap-4">
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="praise">Praise</option>
          <option value="suggestion">Suggestion</option>
          <option value="improvement">Improvement</option>
          <option value="request">Request</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Categories</option>
          <option value="ui-ux">UI/UX</option>
          <option value="productivity">Productivity</option>
          <option value="performance">Performance</option>
          <option value="platform">Platform</option>
          <option value="integration">Integration</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Sort by</option>
          <option value="votes">Most Helpful</option>
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="space-y-4">
        {feedbackItems.map((feedback) => (
          <div key={feedback.id} className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(feedback.type)}`}>
                      {getTypeIcon(feedback.type)}
                      <span>{feedback.type}</span>
                    </div>
                    <span className="rounded bg-secondary px-2 py-1 text-xs font-medium">
                      {feedback.category}
                    </span>
                    {feedback.helpful && (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
                        Helpful
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold">{feedback.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feedback.content}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by {feedback.author}</span>
                    <span>•</span>
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>

                  {feedback.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {feedback.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
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
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span className="text-sm font-medium">{feedback.votes}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                  💬 Reply
                </button>
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                  🔄 Share
                </button>
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                  📌 Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-8">
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          Load More Feedback
        </button>
      </div>
    </div>
  );
}
