'use client';

import { Link, useLocation } from '@tanstack/react-router';
import {
  Bell,
  ClipboardList,
  Command,
  MessageSquare,
  Route,
  ScrollText,
  Settings,
  Users,
} from 'lucide-react';
import * as React from 'react';

import { NavUser } from '@/components/nav-user';
import { Label } from '@/components/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { useSidebarRight } from '@/contexts/sidebar-right';

// This is sample data
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Feedback',
      url: '/boards',
      icon: MessageSquare,
      isActive: true,
    },
    {
      title: 'Roadmap',
      url: '/roadmaps',
      icon: Route,
      isActive: false,
    },
    {
      title: 'Changelog',
      url: '/changelogs',
      icon: ScrollText,
      isActive: false,
    },
    {
      title: 'Surveys',
      url: '/surveys',
      icon: ClipboardList,
      isActive: false,
    },
    {
      title: 'Users',
      url: '/users',
      icon: Users,
      isActive: false,
    },
  ],
  mails: [
    {
      name: 'William Smith',
      email: 'williamsmith@example.com',
      subject: 'Meeting Tomorrow',
      date: '09:34 AM',
      teaser:
        'Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.',
    },
    {
      name: 'Alice Smith',
      email: 'alicesmith@example.com',
      subject: 'Re: Project Update',
      date: 'Yesterday',
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: 'Bob Johnson',
      email: 'bobjohnson@example.com',
      subject: 'Weekend Plans',
      date: '2 days ago',
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: 'Emily Davis',
      email: 'emilydavis@example.com',
      subject: 'Re: Question about Budget',
      date: '2 days ago',
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: 'Michael Wilson',
      email: 'michaelwilson@example.com',
      subject: 'Important Announcement',
      date: '1 week ago',
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: 'Sarah Brown',
      email: 'sarahbrown@example.com',
      subject: 'Re: Feedback on Proposal',
      date: '1 week ago',
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: 'David Lee',
      email: 'davidlee@example.com',
      subject: 'New Project Idea',
      date: '1 week ago',
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: 'Olivia Wilson',
      email: 'oliviawilson@example.com',
      subject: 'Vacation Plans',
      date: '1 week ago',
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: 'James Martin',
      email: 'jamesmartin@example.com',
      subject: 'Re: Conference Registration',
      date: '1 week ago',
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: 'Sophia White',
      email: 'sophiawhite@example.com',
      subject: 'Team Dinner',
      date: '1 week ago',
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [mails, setMails] = React.useState(data.mails);
  const { setOpen } = useSidebar();
  const location = useLocation();
  const { setContainer } = useSidebarRight();

  const currentNavItem = React.useMemo(() => {
    return (
      data.navMain.find((item) => location.pathname.startsWith(item.url)) ||
      data.navMain[0]
    );
  }, [location.pathname]);

  return (
    <Sidebar
      className="overflow-hidden border-muted *:data-[sidebar=sidebar]:flex-row"
      collapsible="icon"
      {...props}
    >
      <Sidebar
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-muted border-r"
        collapsible="none"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="md:h-8 md:p-0" size="lg">
                <button type="button">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="px-2.5 md:px-2"
                      isActive={location.pathname.startsWith(item.url)}
                      tooltip={{ children: item.title, hidden: false }}
                    >
                      <Link
                        onClick={() => {
                          const mail = data.mails.sort(
                            () => Math.random() - 0.5
                          );
                          setMails(
                            mail.slice(
                              0,
                              Math.max(5, Math.floor(Math.random() * 10) + 1)
                            )
                          );
                        }}
                        to={item.url}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="px-2.5 md:px-2"
                tooltip={{ children: 'Notifications', hidden: false }}
              >
                <Bell />
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="px-2.5 md:px-2"
                tooltip={{ children: 'Settings', hidden: false }}
              >
                <Link search={{ tab: 'general' }} to="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <Sidebar
        className="hidden flex-1 border-muted md:flex"
        collapsible="none"
      >
        <SidebarHeader className="gap-3.5 border-muted border-b p-3">
          <div className="flex w-full items-center justify-between">
            <div className="font-medium text-base text-foreground">
              {currentNavItem?.title}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent
              className="overflow-x-hidden"
              ref={(el) => {
                setContainer(el as unknown as HTMLElement);
              }}
            />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
