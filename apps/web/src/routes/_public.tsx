import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

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
    <div className="flex h-full min-h-screen flex-col items-center">
      {/* Navigation Header */}
      <nav className="w-[60rem] flex justify-between items-center gap-4 p-4">
        {/* Logo and Navigation Links */}
        <div className="flex items-center justify-center gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-transparent">
              <span className="size-5 bg-accent p-4 aspect-square rounded flex items-center justify-center ">
                A
              </span>
            </div>
            <div className="hidden xs:block">
              <span className="text-lg font-medium text-gray-900">A</span>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              to="/board"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname.includes("/board")
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Feedback
            </Link>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            {/* User Avatar Button */}
            <button className="p-0.5 rounded-full shadow-sm  transition-colors">
              <div className="w-8 h-8 rounded-full border border-accent-foreground overflow-hidden">
                <span className="size-5 bg-accent p-4 aspect-square rounded-full flex items-center justify-center ">
                  ?
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
