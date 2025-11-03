import { cn } from '@workspace/ui/lib/utils';
import type { FC } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { status as allStatus } from '@/mock-data/status';
import { useFilterStore } from '@/store/filter-store';
import { useSearchStore } from '@/store/search-store';
import { useViewStore } from '@/store/view-store';
import { GroupIssues } from './group-issues';
import { CustomDragLayer } from './issue-grid';
import { SearchIssues } from './search-issues';

export default function AllIssues() {
  const { isSearchOpen, searchQuery } = useSearchStore();
  const { viewType } = useViewStore();
  const { hasActiveFilters } = useFilterStore();

  const isSearching = isSearchOpen && searchQuery.trim() !== '';
  const isViewTypeGrid = viewType === 'grid';
  const isFiltering = hasActiveFilters();

  let content: React.ReactNode;
  if (isSearching) {
    content = <SearchIssuesView />;
  } else if (isFiltering) {
    content = <FilteredIssuesView isViewTypeGrid={isViewTypeGrid} />;
  } else {
    content = <GroupIssuesListView isViewTypeGrid={isViewTypeGrid} />;
  }

  return (
    <div className={cn('h-full w-full', isViewTypeGrid && 'overflow-x-auto')}>
      {content}
    </div>
  );
}

const SearchIssuesView = () => (
  <div className='mb-6 px-6'>
    <SearchIssues />
  </div>
);

const FilteredIssuesView: FC<{
  isViewTypeGrid: boolean;
}> = ({ isViewTypeGrid = false }) => (
  <DndProvider backend={HTML5Backend}>
    <CustomDragLayer />
    <div
      className={cn(isViewTypeGrid && 'flex h-full min-w-max gap-3 px-2 py-2')}
    >
      {allStatus.map((statusItem) => (
        <GroupIssues key={statusItem.key} statusKey={statusItem.key} />
      ))}
    </div>
  </DndProvider>
);

const GroupIssuesListView: FC<{
  isViewTypeGrid: boolean;
}> = ({ isViewTypeGrid = false }) => (
  <DndProvider backend={HTML5Backend}>
    <CustomDragLayer />
    <div
      className={cn(isViewTypeGrid && 'flex h-full min-w-max gap-3 px-2 py-2')}
    >
      {allStatus.map((statusItem) => (
        <GroupIssues key={statusItem.key} statusKey={statusItem.key} />
      ))}
    </div>
  </DndProvider>
);
