import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import * as React from 'react';
import { client, orpc } from '@/utils/orpc';

export const Route = createFileRoute('/_public/board')({
  component: BoardLayout,
});

function BoardLayout() {
  return <Outlet />;
}
