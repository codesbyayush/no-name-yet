import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Issues",
      value: "23",
      change: "-5%",
      trend: "down",
    },
    {
      title: "Feature Requests",
      value: "156",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Feedback Items",
      value: "89",
      change: "+15%",
      trend: "up",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "bug",
      title: "New bug report: Login validation issue",
      user: "user123",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "feature",
      title: "Feature request: Advanced search filters",
      user: "poweruser456",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "feedback",
      title: "Positive feedback: Love the new dark mode",
      user: "nightowl",
      time: "6 hours ago",
    },
    {
      id: 4,
      type: "user",
      title: "New user registration",
      user: "newuser789",
      time: "8 hours ago",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bug":
        return (
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
            <svg className="h-4 w-4 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.667-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case "feature":
        return (
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
            <svg className="h-4 w-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case "feedback":
        return (
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
            <svg className="h-4 w-4 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case "user":
        return (
          <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
            <svg className="h-4 w-4 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform's activity and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium tracking-tight">{stat.title}</h3>
              <svg
                className={`h-4 w-4 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {stat.trend === "up" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7M17 7H7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10M7 7h10" />
                )}
              </svg>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <button className="text-sm text-primary hover:text-primary/80">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-3">
            <button className="flex items-center gap-3 rounded-md border p-3 text-left hover:bg-muted">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <svg className="h-4 w-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Create Announcement</p>
                <p className="text-sm text-muted-foreground">Notify all users</p>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-md border p-3 text-left hover:bg-muted">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <svg className="h-4 w-4 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Review Pending Issues</p>
                <p className="text-sm text-muted-foreground">5 items awaiting review</p>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-md border p-3 text-left hover:bg-muted">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <svg className="h-4 w-4 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Generate Reports</p>
                <p className="text-sm text-muted-foreground">Export platform analytics</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
