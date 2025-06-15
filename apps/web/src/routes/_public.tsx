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
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
