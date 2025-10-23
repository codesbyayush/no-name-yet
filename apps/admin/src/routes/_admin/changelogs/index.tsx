import {
  IconCalendar,
  IconDots,
  IconEdit,
  IconEye,
  IconFileWord,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { toast } from 'sonner';
import { SiteHeader } from '@/components/site-header';
import { SidebarRightPortal } from '@/contexts/sidebar-right';
import { adminClient } from '@/utils/admin-orpc';

export const Route = createFileRoute('/_admin/changelogs/')({
  component: ChangelogListPage,
  validateSearch: (search?: Record<string, unknown>) => ({
    status: search?.status as string | undefined,
    tag: search?.tag as string | undefined,
  }),
});

type ChangelogStatus = 'draft' | 'published' | 'archived' | undefined;

function ChangelogListPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const stripDefaults = (s: Partial<typeof search>) => {
    const next = { ...s } as Record<string, string | undefined>;
    if (!next.status || next.status === 'all') {
      next.status = undefined;
    }
    if (!next.tag || next.tag === 'all') {
      next.tag = undefined;
    }
    return next as typeof search;
  };

  // Convert URL params to filter values
  const statusFilter =
    search.status && search.status !== 'all'
      ? (search.status as ChangelogStatus)
      : undefined;
  const tagFilter = search.tag && search.tag !== 'all' ? search.tag : undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['changelogs', statusFilter, tagFilter],
    queryFn: async () => {
      const response = await adminClient.organization.changelog.getAll({
        offset: 0,
        limit: 50,
        status: statusFilter,
        tagId: tagFilter,
      });
      return response;
    },
  });

  const handleDeleteChangelog = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await adminClient.organization.changelog.delete({ id });
      toast.success('Changelog deleted successfully');
      refetch();
    } catch (_error) {
      toast.error('Failed to delete changelog');
    }
  };

  const handleTogglePublish = async (
    id: string,
    currentStatus: string,
    title: string
  ) => {
    const isPublished = currentStatus === 'published';
    const action = isPublished ? 'unpublish' : 'publish';

    if (!confirm(`Are you sure you want to ${action} "${title}"?`)) {
      return;
    }

    try {
      await adminClient.organization.changelog.update({
        id,
        status: isPublished ? 'draft' : 'published',
      });
      toast.success(`Changelog ${action}ed successfully`);
      refetch();
    } catch (_error) {
      toast.error(`Failed to ${action} changelog`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className='bg-green-500' variant='default'>
            Published
          </Badge>
        );
      case 'draft':
        return <Badge variant='secondary'>Draft</Badge>;
      case 'archived':
        return <Badge variant='outline'>Archived</Badge>;
      default:
        return <Badge variant='secondary'>Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string | Date) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // Hardcoded statuses and tags for filtering
  const statuses = [
    { key: 'draft', label: 'Draft' },
    { key: 'published', label: 'Published' },
    { key: 'archived', label: 'Archived' },
  ] as const;

  // TODO: Fetch these from API later
  const tags = [
    { key: 'new', label: 'New', dot: 'bg-green-500' },
    { key: 'improved', label: 'Improved', dot: 'bg-blue-500' },
    { key: 'fixed', label: 'Fixed', dot: 'bg-purple-500' },
  ];

  const sidebarFilters = (
    <div className='space-y-4 px-2 py-2'>
      <div className='px-1 pt-1 pb-2 text-muted-foreground text-sm'>Status</div>
      <SidebarMenu>
        {statuses.map((status) => {
          const active = statusFilter === status.key;
          return (
            <SidebarMenuItem key={status.key}>
              <SidebarMenuButton
                isActive={active}
                onClick={() =>
                  navigate({
                    search: (prev) =>
                      stripDefaults({
                        ...prev,
                        status: active ? 'all' : status.key,
                      }),
                    replace: false,
                  })
                }
              >
                <span
                  className={`mr-1 inline-block size-2 rounded-full ${
                    status.key === 'draft'
                      ? 'bg-gray-400'
                      : status.key === 'published'
                        ? 'bg-green-500'
                        : 'bg-red-400'
                  }`}
                />
                <span>{status.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      <div className='px-1 pt-4 pb-2 text-muted-foreground text-sm'>
        Categories
      </div>
      <SidebarMenu>
        {tags.map((tag) => {
          const active = tagFilter === tag.key;
          return (
            <SidebarMenuItem key={tag.key}>
              <SidebarMenuButton
                isActive={active}
                onClick={() =>
                  navigate({
                    search: (prev) =>
                      stripDefaults({
                        ...prev,
                        tag: active ? 'all' : tag.key,
                      }),
                    replace: false,
                  })
                }
              >
                <span
                  className={`mr-2 inline-block size-2 rounded-full ${tag.dot}`}
                />
                <span>{tag.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      <div className='px-1 pt-4 pb-2 text-muted-foreground text-sm'>More</div>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <IconFileWord className='h-4 w-4' />
            <span>Analytics</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );

  return (
    <>
      <SiteHeader title='Changelogs'>
        <div className='flex items-center gap-2'>
          <Button asChild>
            <Link to='/changelogs/new'>
              <IconPlus className='mr-2 h-4 w-4' />
              Create Changelog
            </Link>
          </Button>
        </div>
      </SiteHeader>
      <SidebarRightPortal>{sidebarFilters}</SidebarRightPortal>

      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='px-4 lg:px-6'>
              {error && (
                <Card className='border-red-200 bg-red-50'>
                  <CardContent className='pt-6'>
                    <p className='text-red-600'>
                      Failed to load changelogs. Please try again.
                    </p>
                    <Button
                      className='mt-2'
                      onClick={() => refetch()}
                      size='sm'
                      variant='outline'
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className='grid gap-4'>
                  {[...new Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1 space-y-2'>
                            <Skeleton className='h-6 w-3/4' />
                            <Skeleton className='h-4 w-1/2' />
                          </div>
                          <Skeleton className='h-6 w-20' />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='flex items-center gap-4 text-muted-foreground text-sm'>
                          <Skeleton className='h-4 w-24' />
                          <Skeleton className='h-4 w-32' />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : data?.data && data.data.length > 0 ? (
                <div className='grid gap-4'>
                  {data.data.map((changelog) => (
                    <Card
                      className='transition-shadow hover:shadow-md'
                      key={changelog.id}
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1 space-y-1'>
                            <CardTitle className='text-lg'>
                              {changelog.title}
                            </CardTitle>
                            {changelog.excerpt && (
                              <CardDescription className='line-clamp-2'>
                                {changelog.excerpt}
                              </CardDescription>
                            )}
                            {changelog.tag && (
                              <div className='flex items-center gap-2'>
                                <Badge className='text-xs' variant='outline'>
                                  {changelog.tag.name}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className='flex items-center gap-2'>
                            {getStatusBadge(changelog.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size='sm' variant='ghost'>
                                  <IconDots className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem asChild>
                                  <Link to={`/changelogs/edit/${changelog.id}`}>
                                    <IconEdit className='mr-2 h-4 w-4' />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                {changelog.status === 'published' && (
                                  <DropdownMenuItem asChild>
                                    <Link
                                      target='_blank'
                                      to={`/public/changelog/${changelog.slug}`}
                                    >
                                      <IconEye className='mr-2 h-4 w-4' />
                                      View Public
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTogglePublish(
                                      changelog.id,
                                      changelog.status,
                                      changelog.title
                                    )
                                  }
                                >
                                  <IconEye className='mr-2 h-4 w-4' />
                                  {changelog.status === 'published'
                                    ? 'Unpublish'
                                    : 'Publish'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-red-600 focus:text-red-600'
                                  onClick={() =>
                                    handleDeleteChangelog(
                                      changelog.id,
                                      changelog.title
                                    )
                                  }
                                >
                                  <IconTrash className='mr-2 h-4 w-4' />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='flex items-center gap-4 text-muted-foreground text-sm'>
                          {changelog.author && (
                            <div className='flex items-center gap-1'>
                              <IconUser className='h-3 w-3' />
                              <span>{changelog.author.name}</span>
                            </div>
                          )}
                          <div className='flex items-center gap-1'>
                            <IconCalendar className='h-3 w-3' />
                            <span>
                              {changelog.publishedAt
                                ? `Published ${formatDate(changelog.publishedAt)}`
                                : `Created ${formatDate(changelog.createdAt)}`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-12'>
                    <IconFileWord className='mb-4 h-12 w-12 text-muted-foreground' />
                    <h3 className='mb-2 font-semibold text-lg'>
                      No changelogs found
                    </h3>
                    <p className='mb-4 text-center text-muted-foreground'>
                      {statusFilter
                        ? `No ${statusFilter} changelogs exist yet.`
                        : 'Get started by creating your first changelog entry.'}
                    </p>
                    <Button asChild>
                      <Link to='/changelogs/new'>
                        <IconPlus className='mr-2 h-4 w-4' />
                        Create Changelog
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {data?.pagination && data.pagination.total > 0 && (
                <div className='mt-6 text-center text-muted-foreground text-sm'>
                  Showing {data.data.length} of {data.pagination.total}{' '}
                  changelogs
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
