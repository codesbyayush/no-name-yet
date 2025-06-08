import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/")({
  component: TenantHomePage,
});

function TenantHomePage() {
  const { tenantSlug } = Route.useParams();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to {tenantSlug}</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Your dedicated workspace for feedback, collaboration, and growth
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="default" className="text-lg px-4 py-2">
            Tenant: {tenantSlug}
          </Badge>
          <Badge variant="outline">Multi-tenant Platform</Badge>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Link to="/$tenantSlug/public/board" params={{ tenantSlug }}>
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💬 Community Board
              </CardTitle>
              <CardDescription>
                Share feedback, report issues, and request features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Feature requests and enhancements</li>
                <li>• Bug reports and issue tracking</li>
                <li>• General feedback and suggestions</li>
                <li>• Community discussions</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/$tenantSlug/public/roadmap" params={{ tenantSlug }}>
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗺️ Product Roadmap
              </CardTitle>
              <CardDescription>
                Discover what's coming next and vote on features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Upcoming feature releases</li>
                <li>• Development timeline</li>
                <li>• Community-driven priorities</li>
                <li>• Feature voting system</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/$tenantSlug/public/changelog" params={{ tenantSlug }}>
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Changelog
              </CardTitle>
              <CardDescription>
                Stay updated with the latest releases and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Release notes and updates</li>
                <li>• Bug fixes and improvements</li>
                <li>• New feature announcements</li>
                <li>• Version history</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Admin Access */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Administration
          </CardTitle>
          <CardDescription>
            Access administrative tools and settings for {tenantSlug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Manage your tenant configuration, view analytics, and access advanced features.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• User management and permissions</li>
                <li>• System analytics and reporting</li>
                <li>• Integration settings</li>
              </ul>
            </div>
            <Link to="/$tenantSlug/admin" params={{ tenantSlug }}>
              <Button size="lg">
                🔧 Admin Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Overview</CardTitle>
            <CardDescription>
              Key information about your {tenantSlug} workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tenant ID:</span>
              <Badge variant="outline">{tenantSlug}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan:</span>
              <Badge variant="secondary">Professional</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm text-muted-foreground">March 2024</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Recent activity in your {tenantSlug} workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Feedback:</span>
              <span className="text-lg font-bold">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Users:</span>
              <span className="text-lg font-bold">89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Features Shipped:</span>
              <span className="text-lg font-bold">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Satisfaction:</span>
              <span className="text-lg font-bold text-green-600">94.2%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            New to {tenantSlug}? Here's how to make the most of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-semibold mb-2">Explore the Board</h4>
              <p className="text-sm text-muted-foreground">
                Visit the community board to see existing feedback and discussions
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-semibold mb-2">Share Your Thoughts</h4>
              <p className="text-sm text-muted-foreground">
                Submit feature requests, report bugs, or share general feedback
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-semibold mb-2">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">
                Check the roadmap and changelog to stay informed about updates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
