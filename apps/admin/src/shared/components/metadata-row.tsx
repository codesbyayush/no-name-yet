import type { LucideIcon } from 'lucide-react';

interface MetadataRowProps {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
}

export function MetadataRow({ icon: Icon, label, value }: MetadataRowProps) {
  return (
    <div className='flex items-center justify-between py-2'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Icon className='size-4' />
        <span className='text-sm'>{label}</span>
      </div>
      {typeof value === 'string' ? (
        <span className='font-medium text-sm'>{value}</span>
      ) : (
        value
      )}
    </div>
  );
}
