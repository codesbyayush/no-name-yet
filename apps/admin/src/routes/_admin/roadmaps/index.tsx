import data from "@/app/dashboard/data.json";
import { DataTable } from "@/components/data-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/roadmaps/")({
	component: Roadmaps,
});

function Roadmaps() {
	return (
		<div>
			<DataTable data={data} />
		</div>
	);
}
