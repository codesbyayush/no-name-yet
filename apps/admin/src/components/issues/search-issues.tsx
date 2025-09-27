import { useSearchIssues } from '@/react-db/issues';
import { useSearchStore } from '@/store/search-store';
import { IssueLine } from './issue-line';

export function SearchIssues() {
  const { searchQuery, isSearchOpen } = useSearchStore();
  const { data: searchResults = [] } = useSearchIssues(searchQuery);

  if (!isSearchOpen) {
    return null;
  }

  return (
    <div className="w-full">
      {searchQuery.trim() !== '' && (
        <div>
          {searchResults.length > 0 ? (
            <div className="mt-4 rounded-md border">
              <div className="border-b bg-muted/50 px-4 py-2">
                <h3 className="font-medium text-sm">
                  Results ({searchResults.length})
                </h3>
              </div>
              <div className="divide-y">
                {searchResults.map((issue) => (
                  <IssueLine issue={issue} key={issue.id} layoutId={false} />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
