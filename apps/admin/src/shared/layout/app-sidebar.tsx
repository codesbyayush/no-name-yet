import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@workspace/ui/components/sidebar';
import { Skeleton } from '@workspace/ui/components/skeleton';
import type * as React from 'react';
import { useAuth } from '@/contexts';
import type { User } from '@/features/auth';
import { useTeams } from '@/features/auth/hooks/useTeams';
import { NavMain } from '@/shared/navigation/nav-main';
import { NavUser } from '@/shared/navigation/nav-user';
import { navigationRoutes } from '@/shared/navigation/routes';
import { TeamSwitcher } from '@/shared/navigation/team-switcher';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut, handleActiveTeamChange, session } = useAuth();
  const { teams, isLoading } = useTeams();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        {isLoading ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className='flex h-12 w-full items-center gap-2 rounded-md p-2'>
                <Skeleton className='size-8 rounded-lg' />
                <Skeleton className='h-4 flex-1 rounded-md' />
                <Skeleton className='size-4 rounded-md' />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <TeamSwitcher
            activeTeamId={session?.session?.activeTeamId}
            onActiveTeamChange={handleActiveTeamChange}
            teams={teams}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationRoutes.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onSignOut={signOut} user={user as User} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
