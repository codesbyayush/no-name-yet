import { client, orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import * as React from "react";


export const Route = createFileRoute("/_public/board")({
  component: BoardLayout,
});

function BoardLayout() {


  return (
      <Outlet />
  );
}
