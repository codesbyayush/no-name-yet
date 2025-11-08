import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { ChangelogSkeleton } from '@/components/loading';
import { client } from '@/utils/orpc';
import '@blocknote/shadcn/style.css';
import '@blocknote/core/fonts/inter.css';

export const Route = createFileRoute('/_public/changelog')({
  component: ChangelogPage,
});

function HtmlContent({ html }: { html: string }) {
  return (
    <div
      className='prose prose-sm dark:prose-invert max-w-none prose-blockquote:border-l-muted-foreground/30 prose-headings:font-semibold prose-blockquote:text-muted-foreground prose-code:text-foreground prose-headings:text-foreground prose-li:text-foreground prose-p:text-foreground prose-strong:text-foreground'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated server-side and sanitized
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ChangelogPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch published changelogs with infinite scroll
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['public-changelogs'],
    queryFn: ({ pageParam = 0 }) =>
      client.changelog.listPublishedChangelogs({
        offset: pageParam,
        take: 10, // Load 10 entries per page for better UX
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce(
        (acc, page) => acc + page.changelogs.length,
        0,
      );
      return lastPage.pagination.hasMore ? totalLoaded : undefined;
    },
    initialPageParam: 0,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className='text-card-foreground'>
        <div className='relative flex gap-4'>
          <div className='w-2xl flex-1 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card shadow-xs'>
            <div className='p-6'>
              <div className='mb-6'>
                <h1 className='font-bold text-3xl tracking-tight'>Changelog</h1>
                <p className='text-muted-foreground'>
                  Stay up to date with the latest changes and improvements
                </p>
              </div>
              <div className='space-y-6'>
                {Array.from({ length: 3 }, (_, i) => ({
                  id: `changelog-skeleton-${i}`,
                })).map(({ id }) => (
                  <div className={''} key={id}>
                    <ChangelogSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='sticky top-6 hidden h-fit w-3xs flex-col gap-4 md:flex'>
            <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
              <h4 className='mb-2 font-medium capitalize'>
                About the changelog
              </h4>
              <p className='text-muted-foreground text-sm'>
                We publish improvements, fixes and new features regularly.
              </p>
            </div>
            <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
              <h4 className='mb-2 font-medium capitalize'>Stay in the loop</h4>
              <p className='text-muted-foreground text-sm'>
                Check back often to see what&rsquo;s new.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-card-foreground'>
        <div className='relative flex gap-4'>
          <div className='w-2xl flex-1 rounded-3xl border border-destructive/20 bg-linear-to-bl from-destructive/5 to-card shadow-xs'>
            <div className='p-6'>
              <div className='mb-6'>
                <h1 className='font-bold text-3xl tracking-tight'>Changelog</h1>
                <p className='text-muted-foreground'>
                  Stay up to date with the latest changes and improvements
                </p>
              </div>
              <div className='py-12 text-center'>
                <p className='mb-2 font-medium text-destructive'>
                  Failed to load changelog entries.
                </p>
                <p className='text-muted-foreground text-sm'>
                  Please try again later.
                </p>
              </div>
            </div>
          </div>
          <div className='sticky top-6 hidden h-fit w-3xs flex-col gap-4 md:flex'>
            <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
              <h4 className='mb-2 font-medium capitalize'>
                About the changelog
              </h4>
              <p className='text-muted-foreground text-sm'>
                We publish improvements, fixes and new features regularly.
              </p>
            </div>
            <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
              <h4 className='mb-2 font-medium capitalize'>Stay in the loop</h4>
              <p className='text-muted-foreground text-sm'>
                Check back often to see what&rsquo;s new.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Flatten all changelog entries from all pages
  const changelogEntries =
    data?.pages?.flatMap((page) => page.changelogs) || [];

  // Show empty state if no changelogs
  if (changelogEntries.length === 0) {
    return (
      <div className='text-card-foreground'>
        <div className='relative flex gap-4'>
          <div className='w-2xl flex-1 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card shadow-xs'>
            <div className='p-6'>
              <div className='mb-6'>
                <h1 className='font-bold text-3xl tracking-tight'>Changelog</h1>
                <p className='text-muted-foreground'>
                  Stay up to date with the latest changes and improvements
                </p>
              </div>
              <div className='py-12 text-center'>
                <p className='mb-2 text-muted-foreground'>
                  No changelog entries have been published yet.
                </p>
                <p className='text-muted-foreground text-sm'>
                  Check back later for updates and improvements.
                </p>
              </div>
            </div>
          </div>
          <div className='sticky top-6 hidden h-fit w-3xs flex-col gap-4 md:flex'>
            <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
              <h4 className='mb-2 font-medium capitalize'>
                About the changelog
              </h4>
              <p className='text-muted-foreground text-sm'>
                We publish improvements, fixes and new features regularly.
              </p>
            </div>
            <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
              <h4 className='mb-2 font-medium capitalize'>Stay in the loop</h4>
              <p className='text-muted-foreground text-sm'>
                Check back often to see what&rsquo;s new.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='text-card-foreground'>
      <div className='relative flex gap-4'>
        <div className='w-2xl flex-1 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card shadow-xs'>
          <div className='p-6'>
            <div className='mb-6'>
              <h1 className='font-bold text-3xl tracking-tight'>Changelog</h1>
              <p className='text-muted-foreground'>
                Stay up to date with the latest changes and improvements
              </p>
            </div>

            <div className='space-y-0 divide-y divide-muted-foreground/5'>
              {changelogEntries.map((entry, _i) => (
                <div className='space-y-3 p-6' key={entry.id}>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <h2 className='truncate font-semibold text-card-foreground text-xl'>
                        {entry.title}
                      </h2>
                      {entry.version && (
                        <span className='rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-900/40 dark:text-blue-300'>
                          {entry.version}
                        </span>
                      )}
                    </div>
                    <time className='shrink-0 text-muted-foreground text-sm'>
                      {entry.publishedAt &&
                        new Date(entry.publishedAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                    </time>
                  </div>

                  {entry.excerpt && (
                    <div>
                      <p className='text-pretty text-muted-foreground text-sm'>
                        {entry.excerpt}
                      </p>
                    </div>
                  )}

                  {entry.htmlContent && (
                    <div className='mt-2'>
                      <HtmlContent html={entry.htmlContent} />
                    </div>
                  )}

                  {entry.tag && (
                    <div className='mt-2 flex flex-wrap gap-2'>
                      <span className='inline-flex items-center rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground text-xs'>
                        {entry.tag}
                      </span>
                    </div>
                  )}

                  {entry.author && (
                    <div className='mt-2 flex items-center gap-2 text-muted-foreground text-sm'>
                      {entry.author.image && (
                        <img
                          alt={entry.author.name || 'Author'}
                          className='h-5 w-5 rounded-full'
                          src={entry.author.image}
                        />
                      )}
                      <span className='truncate'>By {entry.author.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div className='flex justify-center py-4' ref={loadMoreRef}>
              {isFetchingNextPage && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <div className='h-4 w-4 animate-spin rounded-full border-current border-b-2' />
                  <span className='text-sm'>Loading more changelogs...</span>
                </div>
              )}
              {!hasNextPage && changelogEntries.length > 0 && (
                <p className='text-muted-foreground text-sm'>
                  You've reached the end of the changelog.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='sticky top-6 hidden h-fit w-3xs flex-col gap-4 md:flex'>
          <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
            <h4 className='mb-2 font-medium capitalize'>About the changelog</h4>
            <p className='text-muted-foreground text-sm'>
              We publish improvements, fixes and new features regularly.
            </p>
          </div>
          <div className='z-10 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card p-4 shadow-xs'>
            <h4 className='mb-2 font-medium capitalize'>Stay in the loop</h4>
            <p className='text-muted-foreground text-sm'>
              Check back often to see what&rsquo;s new.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
