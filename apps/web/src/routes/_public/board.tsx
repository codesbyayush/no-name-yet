import { client, orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import * as React from "react";

export const Route = createFileRoute("/_public/board")({
	component: BoardLayout,
});

function BoardLayout() {
	return <Outlet />;
}
