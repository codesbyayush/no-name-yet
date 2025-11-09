import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import { CheckIcon, ChevronRight } from 'lucide-react';
import { useIssueCountForLabel } from '@/react-db/issues';
import { useTags } from '@/react-db/tags';
import { useFilterStore } from '@/store/filter-store';
import type { Tag } from '@/store/tags-store';

interface LabelsFilterProps {
  setActiveFilter: (filter: FilterType | null) => void;
}

type FilterType = 'status' | 'assignee' | 'priority' | 'labels' | 'board';

export function LabelsFilter({ setActiveFilter }: LabelsFilterProps) {
  const { data: tags } = useTags();

  return (
    <Command>
      <div className='flex items-center border-b p-2'>
        <Button
          className='size-6'
          onClick={() => setActiveFilter(null)}
          size='icon'
          variant='ghost'
        >
          <ChevronRight className='size-4 rotate-180' />
        </Button>
        <span className='ml-2 font-medium'>Labels</span>
      </div>
      <CommandInput placeholder='Search labels...' />
      <CommandList>
        <CommandEmpty>No labels found.</CommandEmpty>
        <CommandGroup>
          {tags.map((tag) => (
            <LabelItem key={tag.id} tag={tag} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function LabelItem({ tag }: { tag: Tag }) {
  const { filters, toggleFilter } = useFilterStore();
  const { data: labelCount } = useIssueCountForLabel(tag.id);
  return (
    <CommandItem
      className='flex items-center justify-between'
      key={tag.id}
      onSelect={() => toggleFilter('labels', tag.id)}
      value={tag.id}
    >
      <div className='flex items-center gap-2'>
        <span
          className='size-3 rounded-full'
          style={{ backgroundColor: tag.color }}
        />
        {tag.name}
      </div>
      {filters.labels.includes(tag.id) && (
        <CheckIcon className='ml-auto' size={16} />
      )}
      <span className='text-muted-foreground text-xs'>
        {labelCount?.[0]?.count || 0}
      </span>
    </CommandItem>
  );
}
