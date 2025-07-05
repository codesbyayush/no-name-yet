import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/roadmap")({
	component: RoadmapPage,
});

function RoadmapPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Roadmap</h1>
				<p className="text-muted-foreground">
					See what's coming next and what we're working on
				</p>
			</div>

			<div className="grid gap-6">
				{/* Now */}
				<div className="space-y-3">
					<h2 className="font-semibold text-blue-600 text-xl">Now</h2>
					<div className="rounded-lg border bg-card p-4">
						<h3 className="font-medium">Core Features Implementation</h3>
						<p className="text-muted-foreground text-sm">
							Building the foundation of our platform
						</p>
					</div>
				</div>

				{/* Next */}
				<div className="space-y-3">
					<h2 className="font-semibold text-orange-600 text-xl">Next</h2>
					<div className="rounded-lg border bg-card p-4">
						<h3 className="font-medium">Advanced Analytics</h3>
						<p className="text-muted-foreground text-sm">
							Enhanced reporting and insights
						</p>
					</div>
					<div className="rounded-lg border bg-card p-4">
						<h3 className="font-medium">API Integration</h3>
						<p className="text-muted-foreground text-sm">
							Connect with external services
						</p>
					</div>
				</div>

				{/* Later */}
				<div className="space-y-3">
					<h2 className="font-semibold text-gray-600 text-xl">Later</h2>
					<div className="rounded-lg border bg-card p-4">
						<h3 className="font-medium">Mobile App</h3>
						<p className="text-muted-foreground text-sm">
							Native mobile applications
						</p>
					</div>
					<div className="rounded-lg border bg-card p-4">
						<h3 className="font-medium">Enterprise Features</h3>
						<p className="text-muted-foreground text-sm">
							Advanced security and team management
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
