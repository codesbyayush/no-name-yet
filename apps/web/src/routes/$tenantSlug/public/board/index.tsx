import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/public/board/")({
  component: BoardOverview,
});

function BoardOverview() {
  const { tenantSlug } = Route.useParams();

  return (
    <div className="space-y-6">
      {/* Board Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📝</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,431</div>
            <p className="text-xs text-muted-foreground">+18 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discussions</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">💬</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+12 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Members</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+45 this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👋 Welcome to {tenantSlug} Community Board
          </CardTitle>
          <CardDescription>
            Connect with other users, share feedback, and help shape the future of our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">How to participate:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Share your feature ideas and enhancement requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Report bugs and technical issues you encounter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Provide feedback on existing features and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Vote and comment on posts from other community members</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Community Guidelines:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Be respectful and constructive in your feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Search for existing posts before creating new ones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Provide clear descriptions and steps to reproduce issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Use appropriate categories for your posts</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🚀</div>
            <CardTitle className="text-lg">Feature Requests</CardTitle>
            <CardDescription>
              Suggest new features and improvements
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">
              View Features
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🐛</div>
            <CardTitle className="text-lg">Bug Reports</CardTitle>
            <CardDescription>
              Report issues and technical problems
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full" variant="outline">
              Report Bug
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">💭</div>
            <CardTitle className="text-lg">General Feedback</CardTitle>
            <CardDescription>
              Share thoughts and general suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full" variant="secondary">
              Give Feedback
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest posts and discussions in the {tenantSlug} community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              <Badge variant="default" className="bg-green-500">Feature</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Enhanced dashboard analytics</p>
              <p className="text-xs text-muted-foreground">
                Requested by @johndoe • 2 hours ago • 12 votes
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              <Badge variant="destructive">Bug</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Login page not loading on mobile</p>
              <p className="text-xs text-muted-foreground">
                Reported by @janedoe • 4 hours ago • Under review
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              <Badge variant="secondary">Feedback</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Love the new design updates!</p>
              <p className="text-xs text-muted-foreground">
                Posted by @designfan • 6 hours ago • 8 likes
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              <Badge variant="default" className="bg-blue-500">Feature</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Dark mode toggle in settings</p>
              <p className="text-xs text-muted-foreground">
                Requested by @nightowl • 1 day ago • 24 votes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
