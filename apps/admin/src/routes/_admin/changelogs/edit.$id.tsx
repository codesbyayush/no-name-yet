import { ChangelogForm } from "@/components/admin/changelog-form";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { adminClient } from "@/utils/admin-orpc";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/changelogs/edit/$id")({
	component: EditChangelogPage,
});

function EditChangelogPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	// Fetch changelog data for editing
	const {
		data: changelogData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["changelog", id],
		queryFn: async () => {
			const response = await adminClient.changelog.get({ id });
			return response.data;
		},
	});

	const handleSuccess = () => {
		navigate({ to: "/changelogs" });
	};

	if (isLoading) {
		return (
			<>
				<SiteHeader title="Edit Changelog">
					<Button variant="outline" asChild>
						<Link to="/changelogs">
							<IconArrowLeft className="mr-2 h-4 w-4" />
							Back to Changelogs
						</Link>
					</Button>
				</SiteHeader>

				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4 lg:px-6">
								<div className="mx-auto max-w-4xl">
									<div className="py-12 text-center">
										<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
										<p className="text-muted-foreground">
											Loading changelog...
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	if (error || !changelogData) {
		return (
			<>
				<SiteHeader title="Edit Changelog">
					<Button variant="outline" asChild>
						<Link to="/changelogs">
							<IconArrowLeft className="mr-2 h-4 w-4" />
							Back to Changelogs
						</Link>
					</Button>
				</SiteHeader>

				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4 lg:px-6">
								<div className="mx-auto max-w-4xl">
									<div className="py-12 text-center">
										<h2 className="mb-4 font-semibold text-2xl text-red-600">
											Error
										</h2>
										<p className="mb-6 text-muted-foreground">
											Failed to load changelog. Please try again.
										</p>
										<Button asChild>
											<Link to="/changelogs">
												<IconArrowLeft className="mr-2 h-4 w-4" />
												Back to Changelogs
											</Link>
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<SiteHeader title="Edit Changelog">
				<Button variant="outline" asChild>
					<Link to="/changelogs">
						<IconArrowLeft className="mr-2 h-4 w-4" />
						Back to Changelogs
					</Link>
				</Button>
			</SiteHeader>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="px-4 lg:px-6">
							<div className="mx-auto max-w-4xl">
								<div className="mb-6">
									<h1 className="mb-2 font-semibold text-2xl">
										Edit Changelog
									</h1>
									<p className="text-muted-foreground">
										Update your changelog entry with new content and
										information.
									</p>
								</div>

								<ChangelogForm
									mode="edit"
									changelogId={id}
									initialData={{
										title: changelogData.title,
										content: changelogData.content,
										status: changelogData.status,
										tag: changelogData.tag?.id,
									}}
									onSuccess={handleSuccess}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
