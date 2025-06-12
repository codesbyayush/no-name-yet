import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  const location = useLocation();

  const publicLinks = [
    { to: "/board", label: "Board" },
    { to: "/roadmap", label: "Roadmap" },
    { to: "/changelog", label: "Changelog" },
  ];

  return (
    <div className="flex h-full flex-col">
      <nav className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Public Dashboard</h1>
          <div className="flex gap-6">
            {publicLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`transition-colors hover:text-foreground/80 ${
                  location.pathname.startsWith(to)
                    ? "text-foreground font-medium"
                    : "text-foreground/60"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
