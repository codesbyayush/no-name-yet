import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/board')({
  component: BoardLayout,
});

function BoardLayout() {
  return <Outlet />;
}
