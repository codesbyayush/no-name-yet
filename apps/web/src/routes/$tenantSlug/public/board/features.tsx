import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/public/board/features")({
  component: FeaturesPage,
});

function FeaturesPage() {
  const { tenantSlug } = Route.useParams();

  const featuresData = [
    {
      id: 1,
      title: "Enhanced Dashboard Analytics",
      description: "Add more detailed analytics and reporting capabilities to the main dashboard with customizable widgets and real-time data visualization.",
      author: "johndoe",
      votes: 24,
      status: "Under Review",
      statusColor: "bg-yellow-500",
      createdAt: "2 days ago",
      tags: ["analytics", "dashboard", "ui"],
    },
    {
      id: 2,
      title: "Dark Mode Toggle",
      description: "Implement a system-wide dark mode toggle that users can access from the settings page or header menu.",
      author: "nightowl",
      votes: 18,
      status: "Planned",
      statusColor: "bg-blue-500",
      createdAt: "1 week ago",
      tags: ["ui", "accessibility", "settings"],
    },
    {
      id: 3,
      title: "Advanced Search Filters",
      description: "Add more sophisticated search and filtering options across all data tables and lists in the application.",
      author: "poweruser",
      votes: 15,
      status: "In Progress",
      statusColor: "bg-green-500",
      createdAt: "3 days ago",
      tags: ["search", "filters", "ux"],
    },
    {
      id: 4,
      title: "Mobile App Integration",
      description: "Develop a companion mobile app that syncs with the web platform for on-the-go access to key features.",
      author: "mobilefan",
      votes: 32,
      status: "Considering",
      statusColor: "bg-purple-500",
      createdAt: "5 days ago",
      tags: ["mobile", "integration", "app"],
    },
    {
      id: 5,
      title: "Automated Email Notifications",
      description: "Set up automated email notifications for important updates, deadlines, and system events with customizable preferences.",
      author: "notifylover",
      votes: 12,
      status: "Under Review",
      statusColor: "bg-yellow-500",
      createdAt: "1 day ago",
      tags: ["email", "notifications", "automation"],
    },
    {
      id: 6,
      title: "Team Collaboration Tools",
      description: "Add real-time collaboration features like comments, mentions, and shared workspaces for team projects.",
      author: "teamlead",
      votes: 21,
      status: "Planned",
      statusColor: "bg-blue-500",
      createdAt: "4 days ago",
      tags: ["collaboration", "teams", "real-time"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Feature Requests</h2>
          <p className="text-muted-foreground">
            Suggest and vote on new features for {tenantSlug}
          </p>
        </div>
        <Button>
          🚀 Submit Feature Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📝</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+8 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⚡</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Being developed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">Released</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Votes</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">👍</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5</div>
            <p className="text-xs text-muted-foreground">Per request</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Sort Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">All Features</Button>
            <Button variant="outline" size="sm">Most Voted</Button>
            <Button variant="outline" size="sm">Recent</Button>
            <Button variant="outline" size="sm">In Progress</Button>
            <Button variant="outline" size="sm">Planned</Button>
            <Button variant="outline" size="sm">Under Review</Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Requests List */}
      <div className="space-y-4">
        {featuresData.map((feature) => (
          <Card key={feature.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <Badge className={`${feature.statusColor} text-white`}>
                      {feature.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm mb-3">
                    {feature.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {feature.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2">
                    <span className="text-lg">👍</span>
                    <span className="text-sm font-bold">{feature.votes}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>By @{feature.author}</span>
                  <span>•</span>
                  <span>{feature.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    💬 Comment
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
          Load More Features
        </Button>
      </div>
    </div>
  );
}
