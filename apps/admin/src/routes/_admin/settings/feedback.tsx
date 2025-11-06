import { createFileRoute } from '@tanstack/react-router';
import { FeedbackSettings } from '@/features/settings/components/';

export const Route = createFileRoute('/_admin/settings/feedback')({
  component: RouteComponent,
});

function RouteComponent() {
  return <FeedbackSettings />;
}
