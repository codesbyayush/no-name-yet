import { Link, useLocation } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const location = useLocation();

  const mainLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  const publicLinks = [
    { to: "/public/board", label: "Board" },
    { to: "/public/roadmap", label: "Roadmap" },
    { to: "/public/changelog", label: "Changelog" },
  ];

  const adminLinks = [{ to: "/admin", label: "Admin Dashboard" }];

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
                    ? "text-foreground font-medium"
                    : "text-foreground/60"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Public Navigation */}
          <div className="flex gap-4">
            <span className="text-sm text-muted-foreground">Public:</span>
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

          {/* Admin Navigation */}
          <div className="flex gap-4">
            <span className="text-sm text-muted-foreground">Admin:</span>
            {adminLinks.map(({ to, label }) => (
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
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
