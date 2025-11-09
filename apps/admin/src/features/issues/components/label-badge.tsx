import { Badge } from '@workspace/ui/components/badge';
import { useTags } from '@/react-db/tags';

export function LabelBadge({ tags }: { tags?: string[] }) {
  const { data: tagsData } = useTags();
  const availableTags = tagsData?.filter((t) => tags?.includes(t.id));
  return (
    <>
      {availableTags?.map((l) => (
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
