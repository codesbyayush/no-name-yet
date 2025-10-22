import { Skeleton } from '@/components/ui/skeleton';

export function FeedbackSkeleton() {
  return (
    <div className='space-y-1 p-6'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex-1'>
          <Skeleton className='mb-2 h-6 w-3/4' />
          <Skeleton className='h-4 w-full' />
        </div>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-16' />
          <Skeleton className='h-8 w-16' />
        </div>
      </div>
      <div className='flex items-center justify-between pt-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-7 w-7 rounded-full' />
          <div className='flex items-center gap-3'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-3 w-16' />
          </div>
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-6 w-16' />
          <Skeleton className='h-6 w-20' />
        </div>
      </div>
    </div>
  );
}
