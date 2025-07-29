import { Link, useLocation, useParams } from "@tanstack/react-router";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const location = useLocation();
  const params = useParams({ strict: false });

  // Check if we're in a tenant context
  const tenantSlug = (params as any)?.tenantSlug;
  const isInTenant = Boolean(tenantSlug);

  const mainLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/landing", label: "Landing" },
  ];

  // Tenant-aware links
  const getTenantLinks = (slug: string) => ({
    public: [
      { to: `/${slug}/public/board`, label: "Board" },
      { to: `/${slug}/public/roadmap`, label: "Roadmap" },
      { to: `/${slug}/public/changelog`, label: "Changelog" },
    ],
    admin: [{ to: `/${slug}/admin`, label: "Admin Dashboard" }],
  });

  // Non-tenant links (legacy)
  const publicLinks = [
    { to: "/board", label: "Board" },
    { to: "/roadmap", label: "Roadmap" },
    { to: "/changelog", label: "Changelog" },
  ];

  const adminLinks = [{ to: "/admin", label: "Admin Dashboard" }];

  const tenantLinks = tenantSlug ? getTenantLinks(tenantSlug) : null;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-6 text-lg">
          {/* Main Navigation */}
          <div className="flex gap-4">
            {mainLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`transition-colors hover:text-foreground/80 ${
                  location.pathname === to
                    ? "font-medium text-foreground"
                    : "text-foreground/60"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Tenant Context Navigation */}
          {isInTenant && tenantLinks && (
            <>
              {/* Tenant Public Navigation */}
              <div className="flex gap-4">
                <span className="text-muted-foreground text-sm">Public:</span>
                {tenantLinks.public.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`transition-colors hover:text-foreground/80 ${
                      location.pathname.startsWith(to)
                        ? "font-medium text-foreground"
                        : "text-foreground/60"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Tenant Admin Navigation */}
              <div className="flex gap-4">
                <span className="text-muted-foreground text-sm">Admin:</span>
                {tenantLinks.admin.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`transition-colors hover:text-foreground/80 ${
                      location.pathname.startsWith(to)
                        ? "font-medium text-foreground"
                        : "text-foreground/60"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Non-tenant Navigation (Legacy) */}
          {!isInTenant && (
            <>
              {/* Public Navigation */}
              <div className="flex gap-4">
                <span className="text-muted-foreground text-sm">Public:</span>
                {publicLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`transition-colors hover:text-foreground/80 ${
                      location.pathname.startsWith(to)
                        ? "font-medium text-foreground"
                        : "text-foreground/60"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Admin Navigation */}
              <div className="flex gap-4">
                <span className="text-muted-foreground text-sm">Admin:</span>
                {adminLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`transition-colors hover:text-foreground/80 ${
                      location.pathname.startsWith(to)
                        ? "font-medium text-foreground"
                        : "text-foreground/60"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Tenant Indicator */}
          {isInTenant && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {tenantSlug}
              </Badge>
              <Link to="/$tenantSlug" params={{ tenantSlug }}>
                <Button variant="ghost" size="sm">
                  🏠 Tenant Home
                </Button>
              </Link>
            </div>
          )}

          {/* Tenant Switcher for non-tenant pages */}
          {!isInTenant && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Try:</span>
              <Link to="/$tenantSlug" params={{ tenantSlug: "demo-tenant" }}>
                <Button variant="outline" size="sm">
                  Demo Tenant
                </Button>
              </Link>
            </div>
          )}

          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
