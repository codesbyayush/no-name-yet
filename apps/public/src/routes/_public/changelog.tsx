import { ChangelogSkeleton } from "@/components/loading";
import { client } from "@/utils/orpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";

export const Route = createFileRoute("/_public/changelog")({
	component: ChangelogPage,
});

function ChangelogPage() {
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Fetch published changelogs with infinite scroll
	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["public-changelogs"],
		queryFn: ({ pageParam = 0 }) =>
			client.changelog.listPublishedChangelogs({
				offset: pageParam,
				take: 10, // Load 10 entries per page for better UX
			}),
		getNextPageParam: (lastPage, allPages) => {
			const totalLoaded = allPages.reduce(
				(acc, page) => acc + page.changelogs.length,
				0,
			);
			return lastPage.pagination.hasMore ? totalLoaded : undefined;
		},
		initialPageParam: 0,
	});

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0];
				if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);

		const currentRef = loadMoreRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Changelog</h1>
					<p className="text-muted-foreground">
						Stay up to date with the latest changes and improvements
					</p>
				</div>
				<div className="space-y-6">
					{/* Loading skeleton */}
					{Array.from({ length: 3 }, (_, i) => ({
						id: `changelog-skeleton-${i}`,
					})).map(({ id }) => (
						<ChangelogSkeleton key={id} />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Changelog</h1>
					<p className="text-muted-foreground">
						Stay up to date with the latest changes and improvements
					</p>
				</div>
				<div className="py-12 text-center">
					<p className="mb-4 text-muted-foreground">
						Failed to load changelog entries. Please try again later.
					</p>
				</div>
			</div>
		);
	}

	// Flatten all changelog entries from all pages
	const changelogEntries =
		data?.pages?.flatMap((page) => page.changelogs) || [];

	// Show empty state if no changelogs
	if (changelogEntries.length === 0) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Changelog</h1>
					<p className="text-muted-foreground">
						Stay up to date with the latest changes and improvements
					</p>
				</div>
				<div className="py-12 text-center">
					<p className="mb-4 text-muted-foreground">
						No changelog entries have been published yet.
					</p>
					<p className="text-muted-foreground text-sm">
						Check back later for updates and improvements.
					</p>
				</div>
			</div>
		);
	}

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
					<div key={entry.id} className="rounded-lg border bg-card p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<h2 className="font-semibold text-xl">{entry.title}</h2>
								{entry.version && (
									<span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-300">
										{entry.version}
									</span>
								)}
							</div>
							<time className="text-muted-foreground text-sm">
								{entry.publishedAt &&
									new Date(entry.publishedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
							</time>
						</div>

						{/* Show excerpt if available */}
						{entry.excerpt && (
							<div className="mb-4">
								<p className="text-muted-foreground text-sm">{entry.excerpt}</p>
							</div>
						)}

						{/* Render full BlockNote content */}
						{entry.htmlContent && (
							<div className="mt-4">
								<div
									className="prose prose-sm dark:prose-invert max-w-none prose-blockquote:border-l-muted-foreground/30 prose-headings:font-semibold prose-blockquote:text-muted-foreground prose-code:text-foreground prose-headings:text-foreground prose-li:text-foreground prose-p:text-foreground prose-strong:text-foreground"
									dangerouslySetInnerHTML={{ __html: entry.htmlContent }}
								/>
							</div>
						)}

						{/* Show tags if available */}
						{entry.tags && entry.tags.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-2">
								{entry.tags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground text-xs"
									>
										{tag}
									</span>
								))}
							</div>
						)}

						{/* Show author if available */}
						{entry.author && (
							<div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
								{entry.author.image && (
									<img
										src={entry.author.image}
										alt={entry.author.name || "Author"}
										className="h-5 w-5 rounded-full"
									/>
								)}
								<span>By {entry.author.name}</span>
							</div>
						)}
					</div>
				))}

				{/* Infinite scroll trigger */}
				<div ref={loadMoreRef} className="flex justify-center py-4">
					{isFetchingNextPage && (
						<div className="flex items-center gap-2 text-muted-foreground">
							<div className="h-4 w-4 animate-spin rounded-full border-current border-b-2" />
							<span className="text-sm">Loading more changelogs...</span>
						</div>
					)}
					{!hasNextPage && changelogEntries.length > 0 && (
						<p className="text-muted-foreground text-sm">
							You've reached the end of the changelog.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
