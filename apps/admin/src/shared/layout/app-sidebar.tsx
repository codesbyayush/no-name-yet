import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar';
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
  const { teams } = useTeams();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher
          activeTeamId={session?.session?.activeTeamId}
          onActiveTeamChange={handleActiveTeamChange}
          teams={teams}
        />
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
