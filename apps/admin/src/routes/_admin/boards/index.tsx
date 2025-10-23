import { createFileRoute } from '@tanstack/react-router';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';
import AllIssues from '@/components/issues/all-issues';
import { CreateIssueModalProvider } from '@/components/issues/create-issue-modal-provider';
import Header from '@/components/issues/header/header';
import { SidebarRightPortal } from '@/contexts/sidebar-right';
import { useUsers } from '@/hooks/use-users';

export const Route = createFileRoute('/_admin/boards/')({
  component: RouteComponent,
  validateSearch: (search?: Record<string, unknown>) => ({
    search: search?.search as string | undefined,
    tag: search?.tag as string | undefined,
    status: search?.status as string | undefined,
    order: search?.order as string | undefined,
    tab: search?.tab as string | undefined,
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  // Triggering users fetch on issues load so it's available for the create issue modal
  const { isLoading: isLoadingUsers, error: usersError } = useUsers();

  const stripDefaults = (s: Partial<typeof search>) => {
    const next = { ...s } as Record<string, string | undefined>;
    if (!next.search || next.search === '') {
      next.search = undefined;
    }
    if (!next.tag || next.tag === 'all') {
      next.tag = undefined;
    }
    if (!next.status || next.status === 'all') {
      next.status = undefined;
    }
    if (!next.order || next.order === 'name-asc') {
      next.order = undefined;
    }
    if (!next.tab || next.tab === 'all') {
      next.tab = undefined;
    }
    return next as typeof search;
  };

  // Hardcoded sections (Statuses, Boards, Tags)
  const statuses = [
    { key: 'open', label: 'Under Review' },
    { key: 'in_progress', label: 'Active' },
    { key: 'resolved', label: 'Done' },
    { key: 'closed', label: 'Closed' },
  ] as const;

  const boards = [
    { key: 'feature', label: 'Feature Request', color: 'text-yellow-400' },
  ];

  const tags = [
    { key: 'high', label: 'High Priority', dot: 'bg-red-500' },
    { key: 'low', label: 'Low Priority', dot: 'bg-rose-400' },
  ];

  const setParam = (patch: Partial<typeof search>) => {
    navigate({
      search: (prev) => stripDefaults({ ...prev, ...patch }),
      replace: false,
    });
  };

  const sidebarFilters = (
    <div className='space-y-4 px-2 py-2'>
      <div className='px-1 pt-1 pb-2 text-muted-foreground text-sm'>
        Statuses
      </div>
      <SidebarMenu>
        {statuses.map((s) => {
          const active = search.status === s.key;
          return (
            <SidebarMenuItem key={s.key}>
              <SidebarMenuButton
                isActive={active}
                onClick={() => setParam({ status: active ? 'all' : s.key })}
              >
                <span
                  className={`mr-1 inline-block size-2 rounded-full ${
                    s.key === 'open'
                      ? 'bg-gray-400'
                      : s.key === 'in_progress'
                        ? 'bg-yellow-500'
                        : s.key === 'resolved'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                  }`}
                />
                <span>{s.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      <div className='px-1 pt-4 pb-2 text-muted-foreground text-sm'>
        Quick Filters
      </div>
      <SidebarMenu>
        {boards.map((b) => {
          const active = search.tab === b.key;
          return (
            <SidebarMenuItem key={b.key}>
              <SidebarMenuButton
                isActive={active}
                onClick={() => setParam({ tab: active ? 'all' : b.key })}
              >
                <span className={`mr-2 ${b.color}`}>💡</span>
                <span>{b.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      <div className='px-1 pt-4 pb-2 text-muted-foreground text-sm'>Tags</div>
      <SidebarMenu>
        {tags.map((t) => {
          const active = search.tag === t.key;
          return (
            <SidebarMenuItem key={t.key}>
              <SidebarMenuButton
                isActive={active}
                onClick={() => setParam({ tag: active ? 'all' : t.key })}
              >
                <span
                  className={`mr-2 inline-block size-2 rounded-full ${t.dot}`}
                />
                <span>{t.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
  return (
    <div>
      <SidebarRightPortal>{sidebarFilters}</SidebarRightPortal>
      <div className='h-svh overflow-hidden lg:p-2'>
        <CreateIssueModalProvider />
        <div className='flex flex-col items-center justify-start overflow-hidden bg-container lg:rounded-md lg:border'>
          <Header />
          <div className='h-[calc(100svh-80px)] w-full overflow-auto lg:h-[calc(100svh-96px)]'>
            <AllIssues />
          </div>
        </div>
      </div>
    </div>
  );
}
