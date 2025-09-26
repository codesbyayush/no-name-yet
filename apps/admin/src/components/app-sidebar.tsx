import { Link, useLocation } from '@tanstack/react-router';
import {
  // Bell,
  Command,
  MessageSquare,
  ScrollText,
  Settings,
} from 'lucide-react';
import * as React from 'react';

import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSidebarRight } from '@/contexts/sidebar-right';

const data = {
  navMain: [
    {
      title: 'Feedback',
      url: '/boards',
      icon: MessageSquare,
      isActive: true,
    },
    {
      title: 'Changelog',
      url: '/changelogs',
      icon: ScrollText,
      isActive: false,
    },
    // {
    //   title: 'Roadmap',
    //   url: '/roadmaps',
    //   icon: Route,
    //   isActive: false,
    // },

    // {
    //   title: 'Surveys',
    //   url: '/surveys',
    //   icon: ClipboardList,
    //   isActive: false,
    // },
    // {
    //   title: 'Users',
    //   url: '/users',
    //   icon: Users,
    //   isActive: false,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                      <Link to={item.url}>
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
            {/* TODO: Add notifications here too
            <SidebarMenuItem>
              <SidebarMenuButton
                className="px-2.5 md:px-2"
                tooltip={{ children: 'Notifications', hidden: false }}
              >
                <Bell />
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
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
