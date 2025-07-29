import { Skeleton } from "@/components/ui/skeleton";

export function ChangelogSkeleton() {
  return (
    <div className="w-[57.5rem] rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-64" /> {/* text-xl height */}
          <Skeleton className="h-6 w-20 rounded-full" /> {/* version badge */}
        </div>
        <Skeleton className="h-4 w-32" /> {/* date */}
      </div>
      
      {/* Excerpt section */}
      <div className="mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
      </div>
      
      {/* Content section */}
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Tags section */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      
      {/* Author section */}
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
} 