import { Skeleton } from '@workspace/ui/components/skeleton';

export function BoardSkeleton() {
  return (
    <div className='h-auto w-full justify-start p-3 text-left font-medium text-foreground'>
      <div className='flex items-center gap-2'>
        <Skeleton className='h-4 w-4' />
        <Skeleton className='h-4 w-24' />
      </div>
    </div>
  );
}
