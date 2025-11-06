import { createFileRoute } from '@tanstack/react-router';
import { GeneralSettings } from '@/features/settings/components/';

export const Route = createFileRoute('/_admin/settings/general')({
  component: RouteComponent,
});

function RouteComponent() {
  return <GeneralSettings />;
}
