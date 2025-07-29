import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { adminClient } from "@/utils/admin-orpc";
import {
	IconCalendar,
	IconDots,
	IconEdit,
	IconEye,
	IconFileWord,
	IconFilter,
	IconPlus,
	IconTrash,
	IconUser,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/changelogs/")({
	component: ChangelogListPage,
});

type ChangelogStatus = "draft" | "published" | "archived" | undefined;

function ChangelogListPage() {
	const [statusFilter, setStatusFilter] = useState<ChangelogStatus>(undefined);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["changelogs", statusFilter],
		queryFn: async () => {
			const response = await adminClient.changelog.listChangelogs({
				offset: 0,
				take: 50,
				status: statusFilter,
			});
			return response;
		},
	});

	const handleDeleteChangelog = async (id: string, title: string) => {
		if (!confirm(`Are you sure you want to delete "${title}"?`)) {
			return;
		}

		try {
			await adminClient.changelog.deleteChangelog({ id });
			toast.success("Changelog deleted successfully");
			refetch();
		} catch (error) {
			toast.error("Failed to delete changelog");
		}
	};

	const handleTogglePublish = async (
		id: string,
		currentStatus: string,
		title: string,
	) => {
		const isPublished = currentStatus === "published";
		const action = isPublished ? "unpublish" : "publish";

		if (!confirm(`Are you sure you want to ${action} "${title}"?`)) {
			return;
		}

		try {
			await adminClient.changelog.publishChangelog({
				id,
				publish: !isPublished,
			});
			toast.success(`Changelog ${action}ed successfully`);
			refetch();
		} catch (error) {
			toast.error(`Failed to ${action} changelog`);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "published":
				return (
					<Badge variant="default" className="bg-green-500">
						Published
					</Badge>
				);
			case "draft":
				return <Badge variant="secondary">Draft</Badge>;
			case "archived":
				return <Badge variant="outline">Archived</Badge>;
			default:
				return <Badge variant="secondary">Unknown</Badge>;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<>
			<SiteHeader title="Changelogs">
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<IconFilter className="mr-2 h-4 w-4" />
								Filter
								{statusFilter && (
									<Badge variant="secondary" className="ml-2 capitalize">
										{statusFilter}
									</Badge>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setStatusFilter(undefined)}>
								All Changelogs
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setStatusFilter("draft")}>
								Draft
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setStatusFilter("published")}>
								Published
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setStatusFilter("archived")}>
								Archived
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button asChild>
						<Link to="/changelogs/new">
							<IconPlus className="mr-2 h-4 w-4" />
							Create Changelog
						</Link>
					</Button>
				</div>
			</SiteHeader>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="px-4 lg:px-6">
							{error && (
								<Card className="border-red-200 bg-red-50">
									<CardContent className="pt-6">
										<p className="text-red-600">
											Failed to load changelogs. Please try again.
										</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-2"
											onClick={() => refetch()}
										>
											Retry
										</Button>
									</CardContent>
								</Card>
							)}

							{isLoading ? (
								<div className="grid gap-4">
									{[...Array(3)].map((_, i) => (
										<Card key={i}>
											<CardHeader>
												<div className="flex items-start justify-between">
													<div className="flex-1 space-y-2">
														<Skeleton className="h-6 w-3/4" />
														<Skeleton className="h-4 w-1/2" />
													</div>
													<Skeleton className="h-6 w-20" />
												</div>
											</CardHeader>
											<CardContent>
												<div className="flex items-center gap-4 text-muted-foreground text-sm">
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-4 w-32" />
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : data?.changelogs && data.changelogs.length > 0 ? (
								<div className="grid gap-4">
									{data.changelogs.map((changelog) => (
										<Card
											key={changelog.id}
											className="transition-shadow hover:shadow-md"
										>
											<CardHeader>
												<div className="flex items-start justify-between">
													<div className="flex-1 space-y-1">
														<CardTitle className="text-lg">
															{changelog.title}
														</CardTitle>
														{changelog.excerpt && (
															<CardDescription className="line-clamp-2">
																{changelog.excerpt}
															</CardDescription>
														)}
														{changelog.version && (
															<div className="flex items-center gap-2">
																<Badge variant="outline" className="text-xs">
																	v{changelog.version}
																</Badge>
															</div>
														)}
													</div>
													<div className="flex items-center gap-2">
														{getStatusBadge(changelog.status)}
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="sm">
																	<IconDots className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem asChild>
																	<Link to={`/changelogs/edit/${changelog.id}`}>
																		<IconEdit className="mr-2 h-4 w-4" />
																		Edit
																	</Link>
																</DropdownMenuItem>
																{changelog.status === "published" && (
																	<DropdownMenuItem asChild>
																		<Link
																			to={`/public/changelog/${changelog.slug}`}
																			target="_blank"
																		>
																			<IconEye className="mr-2 h-4 w-4" />
																			View Public
																		</Link>
																	</DropdownMenuItem>
																)}
																<DropdownMenuItem
																	onClick={() =>
																		handleTogglePublish(
																			changelog.id,
																			changelog.status,
																			changelog.title,
																		)
																	}
																>
																	<IconEye className="mr-2 h-4 w-4" />
																	{changelog.status === "published"
																		? "Unpublish"
																		: "Publish"}
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() =>
																		handleDeleteChangelog(
																			changelog.id,
																			changelog.title,
																		)
																	}
																	className="text-red-600 focus:text-red-600"
																>
																	<IconTrash className="mr-2 h-4 w-4" />
																	Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											</CardHeader>
											<CardContent>
												<div className="flex items-center gap-4 text-muted-foreground text-sm">
													{changelog.author && (
														<div className="flex items-center gap-1">
															<IconUser className="h-3 w-3" />
															<span>{changelog.author.name}</span>
														</div>
													)}
													<div className="flex items-center gap-1">
														<IconCalendar className="h-3 w-3" />
														<span>
															{changelog.publishedAt
																? `Published ${formatDate(changelog.publishedAt)}`
																: `Created ${formatDate(changelog.createdAt)}`}
														</span>
													</div>
													{changelog.tags && changelog.tags.length > 0 && (
														<div className="flex flex-wrap items-center gap-1">
															{changelog.tags.slice(0, 3).map((tag, index) => (
																<Badge
																	key={index}
																	variant="outline"
																	className="text-xs"
																>
																	{tag}
																</Badge>
															))}
															{changelog.tags.length > 3 && (
																<span className="text-xs">
																	+{changelog.tags.length - 3} more
																</span>
															)}
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="flex flex-col items-center justify-center py-12">
										<IconFileWord className="mb-4 h-12 w-12 text-muted-foreground" />
										<h3 className="mb-2 font-semibold text-lg">
											No changelogs found
										</h3>
										<p className="mb-4 text-center text-muted-foreground">
											{statusFilter
												? `No ${statusFilter} changelogs exist yet.`
												: "Get started by creating your first changelog entry."}
										</p>
										<Button asChild>
											<Link to="/changelogs/new">
												<IconPlus className="mr-2 h-4 w-4" />
												Create Changelog
											</Link>
										</Button>
									</CardContent>
								</Card>
							)}

							{data?.pagination && data.pagination.totalCount > 0 && (
								<div className="mt-6 text-center text-muted-foreground text-sm">
									Showing {data.changelogs.length} of{" "}
									{data.pagination.totalCount} changelogs
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
