import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/public/roadmap")({
  component: RoadmapPage,
});

function RoadmapPage() {
  const { tenantSlug } = Route.useParams();

  const roadmapData = [
    {
      quarter: "Q1 2024",
      status: "Completed",
      statusColor: "bg-green-500",
      items: [
        {
          title: "Enhanced Dashboard Analytics",
          description: "Advanced reporting and customizable widgets",
          priority: "High",
          votes: 156,
          completed: true,
        },
        {
          title: "Mobile App Launch",
          description: "Native iOS and Android applications",
          priority: "High",
          votes: 234,
          completed: true,
        },
        {
          title: "Dark Mode Implementation",
          description: "System-wide theme toggle functionality",
          priority: "Medium",
          votes: 89,
          completed: true,
        },
      ],
    },
    {
      quarter: "Q2 2024",
      status: "In Progress",
      statusColor: "bg-blue-500",
      items: [
        {
          title: "Advanced Search & Filters",
          description: "AI-powered search with intelligent filtering",
          priority: "High",
          votes: 201,
          completed: false,
          progress: 75,
        },
        {
          title: "Team Collaboration Tools",
          description: "Real-time collaboration and shared workspaces",
          priority: "High",
          votes: 178,
          completed: false,
          progress: 60,
        },
        {
          title: "API Rate Limiting",
          description: "Improved API performance and throttling",
          priority: "Medium",
          votes: 67,
          completed: false,
          progress: 90,
        },
        {
          title: "Email Notification System",
          description: "Customizable notification preferences",
          priority: "Medium",
          votes: 112,
          completed: false,
          progress: 40,
        },
      ],
    },
    {
      quarter: "Q3 2024",
      status: "Planned",
      statusColor: "bg-yellow-500",
      items: [
        {
          title: "Advanced Permission System",
          description: "Granular role-based access controls",
          priority: "High",
          votes: 145,
          completed: false,
        },
        {
          title: "Integration Marketplace",
          description: "Third-party app integrations and plugins",
          priority: "High",
          votes: 189,
          completed: false,
        },
        {
          title: "Automated Workflows",
          description: "No-code automation builder",
          priority: "Medium",
          votes: 98,
          completed: false,
        },
        {
          title: "Advanced Analytics Export",
          description: "Export data in multiple formats",
          priority: "Low",
          votes: 45,
          completed: false,
        },
      ],
    },
    {
      quarter: "Q4 2024",
      status: "Under Review",
      statusColor: "bg-purple-500",
      items: [
        {
          title: "AI-Powered Insights",
          description: "Machine learning recommendations",
          priority: "High",
          votes: 267,
          completed: false,
        },
        {
          title: "White-label Solutions",
          description: "Customizable branding for enterprise clients",
          priority: "Medium",
          votes: 123,
          completed: false,
        },
        {
          title: "Advanced Security Features",
          description: "2FA, SSO, and audit logging",
          priority: "High",
          votes: 156,
          completed: false,
        },
      ],
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-orange-500";
      case "Low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return "✅";
      case "In Progress":
        return "🚧";
      case "Planned":
        return "📋";
      case "Under Review":
        return "🔍";
      default:
        return "📝";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Roadmap</h1>
          <p className="text-muted-foreground">
            Discover what's coming next for {tenantSlug}
          </p>
        </div>
        <Button>💡 Suggest Feature</Button>
      </div>

      {/* Roadmap Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Features
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🚀</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Across all quarters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Released features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Development
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🚧</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently building</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Community Votes
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">👍</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1k</div>
            <p className="text-xs text-muted-foreground">Total votes cast</p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚧</span>
              <span className="text-sm">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="text-sm">Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <span className="text-sm">Under Review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Timeline */}
      <div className="space-y-8">
        {roadmapData.map((quarter, quarterIndex) => (
          <div key={quarter.quarter} className="relative">
            {/* Timeline Line */}
            {quarterIndex !== roadmapData.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border"></div>
            )}

            {/* Quarter Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-border bg-background">
                <span className="text-lg">{getStatusIcon(quarter.status)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{quarter.quarter}</h2>
                <Badge className={`${quarter.statusColor} text-white`}>
                  {quarter.status}
                </Badge>
              </div>
            </div>

            {/* Quarter Items */}
            <div className="ml-16 grid gap-4 md:grid-cols-2">
              {quarter.items.map((item, itemIndex) => (
                <Card
                  key={itemIndex}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            {item.title}
                          </CardTitle>
                          {item.completed && (
                            <Badge
                              variant="default"
                              className="bg-green-500 text-white"
                            >
                              ✓ Done
                            </Badge>
                          )}
                          <Badge
                            className={`${getPriorityColor(item.priority)} text-white`}
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm mb-3">
                          {item.description}
                        </CardDescription>

                        {/* Progress Bar for In Progress items */}
                        {"progress" in item &&
                          item.progress !== undefined &&
                          !item.completed && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{item.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex flex-col gap-1 h-auto py-2"
                        >
                          <span className="text-lg">👍</span>
                          <span className="text-sm font-bold">
                            {item.votes}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Have Ideas?</CardTitle>
          <CardDescription>
            Help shape the future of {tenantSlug} by sharing your feature
            requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button>💡 Submit Feature Request</Button>
            <Button variant="outline">📊 View All Features</Button>
            <Button variant="outline">💬 Join Discussion</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
