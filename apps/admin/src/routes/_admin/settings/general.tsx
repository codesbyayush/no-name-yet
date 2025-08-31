import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_admin/settings/general')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_admin/settings/general"!</div>;
}
