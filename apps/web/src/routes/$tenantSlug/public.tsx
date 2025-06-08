import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export const Route = createFileRoute("/$tenantSlug/public")({
  component: PublicLayout,
});

function PublicLayout() {
  const { tenantSlug } = Route.useParams();
  const location = useLocation();

  const publicLinks = [
    { to: "/$tenantSlug/public/board", label: "Board" },
    { to: "/$tenantSlug/public/roadmap", label: "Roadmap" },
    { to: "/$tenantSlug/public/changelog", label: "Changelog" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Public Portal</h1>
              <Badge variant="outline">{tenantSlug}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/$tenantSlug/admin" params={{ tenantSlug }}>
                <Button variant="outline" size="sm">
                  Admin Dashboard
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

      {/* Public Navigation */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-6">
            {publicLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                params={{ tenantSlug }}
                className="flex items-center px-3 py-4 text-sm font-medium transition-colors hover:text-foreground"
                activeProps={{
                  className: "text-foreground border-b-2 border-primary",
                }}
                inactiveProps={{
                  className: "text-muted-foreground",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
