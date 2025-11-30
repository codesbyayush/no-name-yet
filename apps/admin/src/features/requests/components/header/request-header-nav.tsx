import { Separator } from '@workspace/ui/components/separator';
import { SidebarTrigger } from '@workspace/ui/components/sidebar';
import { SearchInput } from '@/shared/components';
import { useRequestStore } from '@/store/request-store';

export function RequestHeaderNav() {
  const {
    isSearchOpen,
    toggleSearch,
    closeSearch,
    setSearchQuery,
    searchQuery,
  } = useRequestStore();

  return (
    <div className='flex h-10 w-full items-center justify-between border-b px-6 py-1.5'>
      <div className='flex items-center gap-1'>
        <SidebarTrigger className='' />
        <Separator orientation='vertical' className='mx-2 h-4' />
        <h4 className='relative top-0.5 font-medium text-sm'>Requests</h4>
      </div>

      <div className='flex items-center gap-2'>
        <SearchInput
          isOpen={isSearchOpen}
          query={searchQuery}
          placeholder='Search requests...'
          onToggle={toggleSearch}
          onClose={closeSearch}
          onQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
}
