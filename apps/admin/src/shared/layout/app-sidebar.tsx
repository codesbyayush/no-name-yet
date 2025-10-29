import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar';
import { BookOpen, Bot, Settings2, SquareTerminal } from 'lucide-react';
import type * as React from 'react';
import { useAuth } from '@/contexts';
import type { User } from '@/features/auth';
import { useTeams } from '@/features/auth/hooks/useTeams';
import { NavMain } from '@/shared/navigation/nav-main';
import { NavUser } from '@/shared/navigation/nav-user';
import { TeamSwitcher } from '@/shared/navigation/team-switcher';

const data = {
  navMain: [
    {
      title: 'Issues',
      url: '/boards',
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/settings/general',
        },
        {
          title: 'Integrations',
          url: '/settings/integrations',
        },
        {
          title: 'Pricing',
          url: '/settings/pricing',
        },
        {
          title: 'Members',
          url: '/settings/members',
        },
      ],
    },
  ],
  // TODO: take some time figure out how they should work and add them back
  // projects: [
  //   {
  //     name: 'Design Engineering',
  //     url: '#',
  //     icon: Frame,
  //   },
  //   {
  //     name: 'Sales & Marketing',
  //     url: '#',
  //     icon: PieChart,
  //   },
  // ],
};

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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onSignOut={signOut} user={user as User} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
