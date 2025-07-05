import Editor from "@/components/wiki/editor";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useCallback } from "react";

export const Route = createFileRoute("/_admin/wiki")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Editor />
		</div>
	);
}
