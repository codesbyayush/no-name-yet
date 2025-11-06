import { createFileRoute } from '@tanstack/react-router';
import { BoardsSettings } from '@/features/settings/components/';

export const Route = createFileRoute('/_admin/settings/boards')({
  component: RouteComponent,
});

function RouteComponent() {
  return <BoardsSettings />;
}
