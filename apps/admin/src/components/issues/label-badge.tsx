import { Badge } from '@/components/ui/badge';
import type { LabelInterface } from '@/mock-data/labels';

export function LabelBadge({ tags }: { tags: LabelInterface[] }) {
  return (
    <>
      {tags.map((l) => (
        <Badge
          className='gap-1.5 rounded-full bg-background text-muted-foreground'
          key={l.id}
          variant='outline'
        >
          <span
            aria-hidden='true'
            className='size-1.5 rounded-full'
            style={{ backgroundColor: l.color }}
          />
          {l.name}
        </Badge>
      ))}
    </>
  );
}
