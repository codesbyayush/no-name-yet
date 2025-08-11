import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/profile"!</div>;
}
