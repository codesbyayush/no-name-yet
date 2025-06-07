import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex h-full">
      <aside className="w-64 border-r bg-muted/50 p-4">
        <h2 className="mb-4 text-lg font-semibold">Admin Panel</h2>
        <nav className="space-y-2">
          {/* Admin navigation will be added here */}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
