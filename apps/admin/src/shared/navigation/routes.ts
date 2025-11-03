import { BookOpen, Bot, Settings2, SquareTerminal } from 'lucide-react';

export const navigationRoutes = {
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
