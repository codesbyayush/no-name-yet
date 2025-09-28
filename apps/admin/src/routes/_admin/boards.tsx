import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_admin/boards')({
  component: RouteComponent,
  validateSearch: (search?: Record<string, unknown>) => ({
    search: search?.search as string | undefined,
    tag: search?.tag as string | undefined,
    status: search?.status as string | undefined,
    order: search?.order as string | undefined,
    tab: search?.tab as string | undefined,
  }),
});

function RouteComponent() {
  return <Outlet />;
}
