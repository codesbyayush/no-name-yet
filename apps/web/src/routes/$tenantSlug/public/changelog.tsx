import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/public/changelog")({
  component: ChangelogPage,
});

function ChangelogPage() {
  const { tenantSlug } = Route.useParams();

  const changelogData = [
    {
      version: "v2.4.0",
      date: "2024-03-15",
      type: "Major Release",
      typeColor: "bg-blue-500",
      changes: [
        {
          type: "New",
          icon: "🚀",
          title: "Enhanced Dashboard Analytics",
          description: "Introduced advanced reporting capabilities with customizable widgets and real-time data visualization."
        },
        {
          type: "New",
          icon: "🎨",
          title: "Dark Mode Support",
          description: "Added system-wide dark mode toggle with automatic theme detection based on user preferences."
        },
        {
          type: "Improvement",
          icon: "⚡",
          title: "Performance Optimizations",
          description: "Reduced page load times by 40% through code splitting and improved caching strategies."
        },
        {
          type: "Fix",
          icon: "🐛",
          title: "Mobile Navigation Issues",
          description: "Resolved navigation menu not displaying correctly on mobile devices."
        }
      ]
    },
    {
      version: "v2.3.2",
      date: "2024-03-01",
      type: "Patch Release",
      typeColor: "bg-green-500",
      changes: [
        {
          type: "Fix",
          icon: "🔧",
          title: "Email Notification Links",
          description: "Fixed broken links in email notifications that were causing 404 errors."
        },
        {
          type: "Fix",
          icon: "🔒",
          title: "Authentication Session Timeout",
          description: "Resolved issue where user sessions were expiring prematurely."
        },
        {
          type: "Improvement",
          icon: "📱",
          title: "Mobile Responsiveness",
          description: "Improved mobile layout for better user experience on smaller screens."
        }
      ]
    },
    {
      version: "v2.3.1",
      date: "2024-02-20",
      type: "Hotfix",
      typeColor: "bg-red-500",
      changes: [
        {
          type: "Fix",
          icon: "🚨",
          title: "Critical Security Patch",
          description: "Addressed security vulnerability in user authentication system."
        },
        {
          type: "Fix",
          icon: "💾",
          title: "Data Export Bug",
          description: "Fixed issue where large data exports were failing to complete."
        }
      ]
    },
    {
      version: "v2.3.0",
      date: "2024-02-10",
      type: "Minor Release",
      typeColor: "bg-purple-500",
      changes: [
        {
          type: "New",
          icon: "🔍",
          title: "Advanced Search Filters",
          description: "Added powerful search and filtering capabilities across all data tables."
        },
        {
          type: "New",
          icon: "📊",
          title: "Custom Reports",
          description: "Users can now create and save custom reports with personalized metrics."
        },
        {
          type: "Improvement",
          icon: "🎯",
          title: "User Interface Refinements",
          description: "Polished UI elements and improved accessibility throughout the application."
        },
        {
          type: "Fix",
          icon: "🔄",
          title: "Real-time Updates",
          description: "Fixed issue where real-time data updates weren't displaying immediately."
        }
      ]
    },
    {
      version: "v2.2.5",
      date: "2024-01-25",
      type: "Patch Release",
      typeColor: "bg-green-500",
      changes: [
        {
          type: "Improvement",
          icon: "⚡",
          title: "API Response Times",
          description: "Optimized database queries resulting in 25% faster API response times."
        },
        {
          type: "Fix",
          icon: "📤",
          title: "File Upload Progress",
          description: "Resolved issue where file upload progress bar would freeze at 99%."
        },
        {
          type: "Fix",
          icon: "🎨",
          title: "Theme Switching",
          description: "Fixed inconsistent color application when switching between light and dark themes."
        }
      ]
    },
    {
      version: "v2.2.4",
      date: "2024-01-10",
      type: "Patch Release",
      typeColor: "bg-green-500",
      changes: [
        {
          type: "New",
          icon: "🔔",
          title: "In-App Notifications",
          description: "Added real-time notification system for important updates and events."
        },
        {
          type: "Improvement",
          icon: "🗂️",
          title: "File Organization",
          description: "Enhanced file management with better folder structure and search capabilities."
        },
        {
          type: "Fix",
          icon: "🔐",
          title: "Password Reset Flow",
          description: "Improved password reset process with better error handling and validation."
        }
      ]
    }
  ];

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case "New":
        return "bg-green-500";
      case "Improvement":
        return "bg-blue-500";
      case "Fix":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getReleaseTypeIcon = (type: string) => {
    switch (type) {
      case "Major Release":
        return "🎉";
      case "Minor Release":
        return "✨";
      case "Patch Release":
        return "🔧";
      case "Hotfix":
        return "🚨";
      default:
        return "📝";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
          <p className="text-muted-foreground">
            Stay up to date with the latest updates and improvements to {tenantSlug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            📧 Subscribe to Updates
          </Button>
          <Button variant="outline" size="sm">
            📱 Download App
          </Button>
        </div>
      </div>

      {/* Changelog Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Releases</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🚀</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Since launch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Quarter</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">New releases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bug Fixes</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🐛</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Issues resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Features</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✨</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Features added</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">All Releases</Button>
            <Button variant="outline" size="sm">Major Updates</Button>
            <Button variant="outline" size="sm">Bug Fixes</Button>
            <Button variant="outline" size="sm">New Features</Button>
            <Button variant="outline" size="sm">This Year</Button>
            <Button variant="outline" size="sm">Last 30 Days</Button>
          </div>
        </CardContent>
      </Card>

      {/* Changelog Timeline */}
      <div className="space-y-8">
        {changelogData.map((release, releaseIndex) => (
          <div key={release.version} className="relative">
            {/* Timeline Line */}
            {releaseIndex !== changelogData.length - 1 && (
              <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-border"></div>
            )}

            {/* Release Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-border bg-background">
                <span className="text-lg">{getReleaseTypeIcon(release.type)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{release.version}</h2>
                  <Badge className={`${release.typeColor} text-white`}>
                    {release.type}
                  </Badge>
                </div>
                <p className="text-muted-foreground">Released on {release.date}</p>
              </div>
            </div>

            {/* Release Changes */}
            <div className="ml-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's New</CardTitle>
                  <CardDescription>
                    Changes and improvements in this release
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {release.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <span className="text-xl">{change.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getChangeTypeColor(change.type)} text-white text-xs`}>
                              {change.type}
                            </Badge>
                            <h4 className="font-semibold">{change.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{change.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Load Older Releases
        </Button>
      </div>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Stay Updated</CardTitle>
          <CardDescription>
            Never miss an update from {tenantSlug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Get Notified</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Subscribe to our changelog to receive notifications about new releases and updates.
              </p>
              <Button className="w-full">
                📧 Subscribe to Updates
              </Button>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Join the Community</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with other users and share feedback about new features and improvements.
              </p>
              <Button variant="outline" className="w-full">
                💬 Join Discussion
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
