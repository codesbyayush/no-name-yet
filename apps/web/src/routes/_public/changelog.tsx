import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/changelog")({
	component: ChangelogPage,
});

function ChangelogPage() {
	const changelogEntries = [
		{
			version: "1.2.0",
			date: "2024-01-15",
			type: "feature",
			changes: [
				"Added new dashboard analytics",
				"Improved user interface responsiveness",
				"Enhanced search functionality",
			],
		},
		{
			version: "1.1.2",
			date: "2024-01-08",
			type: "fix",
			changes: [
				"Fixed authentication bug",
				"Resolved performance issues with large datasets",
				"Fixed responsive design on mobile devices",
			],
		},
		{
			version: "1.1.1",
			date: "2024-01-01",
			type: "improvement",
			changes: [
				"Updated UI components",
				"Improved loading speeds",
				"Enhanced accessibility features",
			],
		},
		{
			version: "1.1.0",
			date: "2023-12-20",
			type: "feature",
			changes: [
				"Added user feedback system",
				"Implemented real-time notifications",
				"New export functionality",
			],
		},
	];

	const getTypeColor = (type: string) => {
		switch (type) {
			case "feature":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "fix":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			case "improvement":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "feature":
				return "New Feature";
			case "fix":
				return "Bug Fix";
			case "improvement":
				return "Improvement";
			default:
				return "Update";
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Changelog</h1>
				<p className="text-muted-foreground">
					Stay up to date with the latest changes and improvements
				</p>
			</div>

			<div className="space-y-6">
				{changelogEntries.map((entry) => (
					<div key={entry.version} className="rounded-lg border bg-card p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<h2 className="font-semibold text-xl">v{entry.version}</h2>
								<span
									className={`rounded-full px-2 py-1 font-medium text-xs ${getTypeColor(
										entry.type,
									)}`}
								>
									{getTypeLabel(entry.type)}
								</span>
							</div>
							<time className="text-muted-foreground text-sm">
								{new Date(entry.date).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</time>
						</div>

						<ul className="space-y-2">
							{entry.changes.map((change, index) => (
								<li key={index} className="flex items-start gap-2">
									<span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
									<span className="text-sm">{change}</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
