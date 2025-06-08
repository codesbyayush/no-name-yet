import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/$tenantSlug/public/board")({
  component: BoardLayout,
});

function BoardLayout() {
  const { tenantSlug } = Route.useParams();

  const boardLinks = [
    { to: "/$tenantSlug/public/board", label: "Overview", exact: true },
    { to: "/$tenantSlug/public/board/features", label: "Features" },
    { to: "/$tenantSlug/public/board/bugs", label: "Bug Reports" },
    { to: "/$tenantSlug/public/board/feedback", label: "Feedback" },
  ];

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Board</h1>
          <p className="text-muted-foreground">
            Share ideas, report issues, and help improve {tenantSlug}
          </p>
        </div>
      </div>

      {/* Board Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {boardLinks.map(({ to, label, exact }) => (
            <Link
              key={to}
              to={to}
              params={{ tenantSlug }}
              className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              activeProps={{
                className: "border-primary text-primary",
              }}
              inactiveProps={{
                className: "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground",
              }}
              activeOptions={{ exact }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Board Content */}
      <Outlet />
    </div>
  );
}
