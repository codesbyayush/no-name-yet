import { WidgetEmbedCode } from "@/components/admin/widget-embed-code";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/widget")({
	component: WidgetPage,
});

function WidgetPage() {
	return (
		<div className="flex h-full flex-col space-y-6">
			<div className="border-b pb-6">
				<h1 className="font-bold text-3xl tracking-tight">Widget</h1>
				<p className="text-muted-foreground">
					Embed your feedback widget on your website to collect user feedback
					directly.
				</p>
			</div>

			<div className="flex-1">
				<WidgetEmbedCode />
			</div>
		</div>
	);
}
