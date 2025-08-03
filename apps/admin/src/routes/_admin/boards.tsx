import { RenderPostsList } from "@/components/admin/render-posts-list";
import { Filters } from "@/components/filters";
import { SiteHeader } from "@/components/site-header";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/boards")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		search: (search.search as string) || "",
		tag: (search.tag as string) || "all",
		status: (search.status as string) || "all",
		order: (search.order as string) || "name-asc",
		tab: (search.tab as string) || "all",
	}),
});

function RouteComponent() {
	return (
		<div>
			<div className="sticky top-0 z-10 rounded-tl-xl backdrop-blur-2xl">
				<div className="border-muted border-b-[1px] pl-2">
					<SiteHeader title="Boards">
						<Filters />
					</SiteHeader>
				</div>
			</div>
			<div className="px-4 py-3">
				<RenderPostsList />
			</div>
		</div>
	);
}
