import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export const Route = createFileRoute("/$tenantSlug/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { tenantSlug } = Route.useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <Badge variant="outline">{tenantSlug}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/$tenantSlug/public" params={{ tenantSlug }}>
                <Button variant="outline" size="sm">
                  View Public Site
                </Button>
              </Link>
              <Link to="/$tenantSlug" params={{ tenantSlug }}>
                <Button variant="ghost" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link
              to="/$tenantSlug/admin"
              params={{ tenantSlug }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              activeProps={{
                className: "bg-accent text-accent-foreground",
              }}
            >
              📊 Dashboard
            </Link>

            {/* Future admin routes can be added here */}
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Coming Soon:
            </div>
            <div className="px-3 py-1 text-xs text-muted-foreground space-y-1">
              <div>• User Management</div>
              <div>• Settings</div>
              <div>• Analytics</div>
              <div>• Integrations</div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
