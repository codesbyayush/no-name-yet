import { Inbox, Settings2, SquareTerminal } from 'lucide-react';

export const navigationRoutes = {
  navMain: [
    {
      title: 'Issues',
      url: '/boards',
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: 'Requests',
      url: '/requests',
      icon: Inbox,
      isActive: false,
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
          title: 'Boards',
          url: '/settings/boards',
        },
        {
          title: 'Feedback',
          url: '/settings/feedback',
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
