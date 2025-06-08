import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { tenantSlug } = Route.useParams();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your {tenantSlug} tenant settings and monitor activity
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {tenantSlug}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🔥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Items</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">💬</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">+5 new today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks for {tenantSlug}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              👥 Manage Users
            </Button>
            <Button className="w-full justify-start" variant="outline">
              ⚙️ System Settings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              📊 View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              🔧 Integration Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest events in your {tenantSlug} workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Feedback submitted</p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">System backup completed</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Integration updated</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current health and performance metrics for {tenantSlug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">API Status</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Response time: 12ms</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Storage</p>
                <p className="text-xs text-muted-foreground">78% capacity used</p>
              </div>
              <Badge variant="secondary">
                Normal
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
