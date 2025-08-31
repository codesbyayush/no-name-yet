import { useIssuesInfinite } from "@/hooks/use-issues-infinite";
import { cn } from "@/lib/utils";
// import type { Issue } from "@/mock-data/issues";
import { status as allStatus } from "@/mock-data/status";
import { useIssues } from "@/react-db/issues";
import { useFilterStore } from "@/store/filter-store";
import { useIssuesStore } from "@/store/issues-store";
import { useSearchStore } from "@/store/search-store";
import { useViewStore } from "@/store/view-store";
import { type FC, useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GroupIssues } from "./group-issues";
import { CustomDragLayer } from "./issue-grid";
import { SearchIssues } from "./search-issues";

export default function AllIssues() {
	const { isSearchOpen, searchQuery } = useSearchStore();
	const { viewType } = useViewStore();
	const { hasActiveFilters } = useFilterStore();

	const isSearching = isSearchOpen && searchQuery.trim() !== "";
	const isViewTypeGrid = viewType === "grid";
	const isFiltering = hasActiveFilters();

	return (
		<div className={cn("h-full w-full", isViewTypeGrid && "overflow-x-auto")}>
			{isSearching ? (
				<SearchIssuesView />
			) : isFiltering ? (
				<FilteredIssuesView isViewTypeGrid={isViewTypeGrid} />
			) : (
				<GroupIssuesListView isViewTypeGrid={isViewTypeGrid} />
			)}
		</div>
	);
}

const SearchIssuesView = () => (
	<div className="mb-6 px-6">
		<SearchIssues />
	</div>
);

const FilteredIssuesView: FC<{
	isViewTypeGrid: boolean;
}> = ({ isViewTypeGrid = false }) => {
	const { filters } = useFilterStore();
	const { filterIssues } = useIssuesStore();

	// Apply filters to get filtered issues
	const filteredIssues = useMemo(() => {
		return filterIssues(filters);
	}, [filterIssues, filters]);

	// Group filtered issues by status
	// const filteredIssuesByStatus = useMemo(() => {
	// 	const result: Record<string, Issue[]> = {};

	// 	for (const statusItem of allStatus) {
	// 		result[statusItem.key] = filteredIssues.filter(
	// 			(issue) => issue.statusKey === statusItem.key,
	// 		);
	// 	}

	// 	return result;
	// }, [filteredIssues]);

	return (
		<DndProvider backend={HTML5Backend}>
			<CustomDragLayer />
			<div
				className={cn(
					isViewTypeGrid && "flex h-full min-w-max gap-3 px-2 py-2",
				)}
			>
				{allStatus.map((statusItem) => (
					<GroupIssues key={statusItem.key} statusKey={statusItem.key} />
				))}
			</div>
		</DndProvider>
	);
};

const GroupIssuesListView: FC<{
	isViewTypeGrid: boolean;
}> = ({ isViewTypeGrid = false }) => {
	const { data: issuesByStatus } = useIssues();
	const { isLoading, error, lastElementRef, hasNextPage, isFetchingNextPage } =
		useIssuesInfinite();

	return (
		<DndProvider backend={HTML5Backend}>
			<CustomDragLayer />
			<div
				className={cn(
					isViewTypeGrid && "flex h-full min-w-max gap-3 px-2 py-2",
				)}
			>
				{allStatus.map((statusItem) => (
					<GroupIssues key={statusItem.key} statusKey={statusItem.key} />
				))}

				{/* Intersection observer element for infinite loading */}
				{hasNextPage && (
					<div
						ref={lastElementRef}
						className="flex h-4 w-full items-center justify-center"
					>
						{isFetchingNextPage && (
							<div className="text-muted-foreground text-sm">
								Loading more issues...
							</div>
						)}
					</div>
				)}

				{/* Loading state */}
				{isLoading && (
					<div className="flex h-32 w-full items-center justify-center">
						<div className="text-muted-foreground text-sm">
							Loading issues...
						</div>
					</div>
				)}

				{/* Error state */}
				{error && (
					<div className="flex h-32 w-full items-center justify-center">
						<div className="text-destructive text-sm">
							Error loading issues. Please try again.
						</div>
					</div>
				)}
			</div>
		</DndProvider>
	);
};
