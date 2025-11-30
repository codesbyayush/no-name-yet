import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SearchInputProps {
  isOpen: boolean;
  query: string;
  placeholder?: string;
  onToggle: () => void;
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

export function SearchInput({
  isOpen,
  query,
  placeholder = 'Search...',
  onToggle,
  onClose,
  onQueryChange,
}: SearchInputProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>('');

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        isOpen &&
        query.trim() === ''
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, query]);

  if (!isOpen) {
    return (
      <Button
        aria-label='Search'
        className='h-8 w-8'
        onClick={onToggle}
        size='icon'
        variant='ghost'
      >
        <SearchIcon className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <div
      className='relative flex w-64 items-center justify-center transition-all duration-200 ease-in-out'
      ref={searchContainerRef}
    >
      <SearchIcon className='-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-muted-foreground' />
      <Input
        className='h-7 pl-8 text-sm'
        onChange={(e) => {
          previousValueRef.current = query;
          const newValue = e.target.value;
          onQueryChange(newValue);

          if (previousValueRef.current && newValue === '') {
            const inputEvent = e.nativeEvent as InputEvent;
            if (
              inputEvent.inputType !== 'deleteContentBackward' &&
              inputEvent.inputType !== 'deleteByCut'
            ) {
              onClose();
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (query.trim() === '') {
              onClose();
            } else {
              onQueryChange('');
            }
          }
        }}
        placeholder={placeholder}
        ref={searchInputRef}
        type='search'
        value={query}
      />
    </div>
  );
}
