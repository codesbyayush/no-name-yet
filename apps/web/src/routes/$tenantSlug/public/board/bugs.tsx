import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/public/board/bugs")({
  component: BugsPage,
});

function BugsPage() {
  const { tenantSlug } = Route.useParams();

  const bugsData = [
    {
      id: 1,
      title: "Login page not loading on mobile devices",
      description: "When accessing the login page on mobile browsers (tested on Chrome and Safari), the page fails to load completely and shows a blank screen after the header.",
      author: "janedoe",
      priority: "High",
      priorityColor: "bg-red-500",
      status: "Under Investigation",
      statusColor: "bg-yellow-500",
      createdAt: "3 hours ago",
      tags: ["mobile", "login", "ui"],
      severity: "Critical",
      reproduced: true,
    },
    {
      id: 2,
      title: "Dashboard charts not updating in real-time",
      description: "The analytics charts on the main dashboard are not reflecting real-time data changes. Users need to manually refresh the page to see updated information.",
      author: "datauser",
      priority: "Medium",
      priorityColor: "bg-orange-500",
      status: "In Progress",
      statusColor: "bg-blue-500",
      createdAt: "1 day ago",
      tags: ["dashboard", "analytics", "real-time"],
      severity: "Major",
      reproduced: true,
    },
    {
      id: 3,
      title: "Email notifications contain broken links",
      description: "Email notifications sent from the system contain links that result in 404 errors when clicked. This affects password reset and invitation emails.",
      author: "emailbug",
      priority: "High",
      priorityColor: "bg-red-500",
      status: "Fixed",
      statusColor: "bg-green-500",
      createdAt: "2 days ago",
      tags: ["email", "links", "notifications"],
      severity: "Major",
      reproduced: true,
    },
    {
      id: 4,
      title: "Search function returns incorrect results",
      description: "When searching for specific terms in the global search, the results include items that don't match the search criteria or exclude relevant matches.",
      author: "searchfan",
      priority: "Medium",
      priorityColor: "bg-orange-500",
      status: "Under Review",
      statusColor: "bg-yellow-500",
      createdAt: "4 days ago",
      tags: ["search", "results", "algorithm"],
      severity: "Minor",
      reproduced: false,
    },
    {
      id: 5,
      title: "File upload progress bar freezes at 99%",
      description: "Large file uploads (>10MB) consistently freeze at 99% completion. The files do upload successfully, but the UI doesn't reflect completion status.",
      author: "fileuploader",
      priority: "Low",
      priorityColor: "bg-blue-500",
      status: "Confirmed",
      statusColor: "bg-purple-500",
      createdAt: "5 days ago",
      tags: ["upload", "progress", "ui"],
      severity: "Minor",
      reproduced: true,
    },
    {
      id: 6,
      title: "Theme colors not applying consistently",
      description: "When users switch between light and dark themes, some UI elements retain colors from the previous theme until page reload.",
      author: "themeuser",
      priority: "Low",
      priorityColor: "bg-blue-500",
      status: "New",
      statusColor: "bg-gray-500",
      createdAt: "6 days ago",
      tags: ["theme", "ui", "colors"],
      severity: "Cosmetic",
      reproduced: true,
    },
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical":
      case "High":
        return "🚨";
      case "Medium":
        return "⚠️";
      case "Low":
        return "ℹ️";
      default:
        return "📝";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-600";
      case "Major":
        return "bg-red-500";
      case "Minor":
        return "bg-yellow-500";
      case "Cosmetic":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bug Reports</h2>
          <p className="text-muted-foreground">
            Report and track technical issues for {tenantSlug}
          </p>
        </div>
        <Button>
          🐛 Report Bug
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🐛</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🔍</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Being investigated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⚡</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Being fixed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">Fixed and deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⏱️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2d</div>
            <p className="text-xs text-muted-foreground">Days to fix</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Sort Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">All Bugs</Button>
            <Button variant="outline" size="sm">High Priority</Button>
            <Button variant="outline" size="sm">Recent</Button>
            <Button variant="outline" size="sm">Open</Button>
            <Button variant="outline" size="sm">In Progress</Button>
            <Button variant="outline" size="sm">Reproduced</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bug Reports List */}
      <div className="space-y-4">
        {bugsData.map((bug) => (
          <Card key={bug.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getPriorityIcon(bug.priority)}</span>
                    <CardTitle className="text-lg">{bug.title}</CardTitle>
                    <Badge className={`${bug.statusColor} text-white`}>
                      {bug.status}
                    </Badge>
                    <Badge className={`${bug.priorityColor} text-white`}>
                      {bug.priority}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm mb-3">
                    {bug.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={`${getSeverityColor(bug.severity)} text-white text-xs`}>
                      {bug.severity}
                    </Badge>
                    {bug.reproduced && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Reproduced
                      </Badge>
                    )}
                    {bug.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2">
                    <span className="text-lg">👍</span>
                    <span className="text-sm font-bold">+1</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Reported by @{bug.author}</span>
                  <span>•</span>
                  <span>{bug.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    💬 Comment
                  </Button>
                  <Button variant="ghost" size="sm">
                    📋 Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    📤 Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Load More Bug Reports
        </Button>
      </div>
    </div>
  );
}
