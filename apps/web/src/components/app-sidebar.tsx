import {
	IconCamera,
	IconChartBar,
	IconCode,
	IconDashboard,
	IconDatabase,
	IconFileAi,
	IconFileDescription,
	IconFileWord,
	IconFolder,
	IconHelp,
	IconInnerShadowTop,
	IconListDetails,
	IconReport,
	IconSearch,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import type * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Public View",
			url: "#",
			icon: IconDashboard,
		},
		// {
		//   title: "Analytics",
		//   url: "#",
		//   icon: IconListDetails,
		// },
		// {
		//   title: "Projects",
		//   url: "#",
		//   icon: IconFolder,
		// },
		// {
		//   title: "Team",
		//   url: "#",
		//   icon: IconUsers,
		// },
	],
	// navClouds: [
	//   {
	//     title: "Capture",
	//     icon: IconCamera,
	//     isActive: true,
	//     url: "#",
	//     items: [
	//       {
	//         title: "Active Proposals",
	//         url: "#",
	//       },
	//       {
	//         title: "Archived",
	//         url: "#",
	//       },
	//     ],
	//   },
	//   {
	//     title: "Proposal",
	//     icon: IconFileDescription,
	//     url: "#",
	//     items: [
	//       {
	//         title: "Active Proposals",
	//         url: "#",
	//       },
	//       {
	//         title: "Archived",
	//         url: "#",
	//       },
	//     ],
	//   },
	//   {
	//     title: "Prompts",
	//     icon: IconFileAi,
	//     url: "#",
	//     items: [
	//       {
	//         title: "Active Proposals",
	//         url: "#",
	//       },
	//       {
	//         title: "Archived",
	//         url: "#",
	//       },
	//     ],
	//   },
	// ],
	navSecondary: [
		{
			title: "Help & Feedback",
			url: "#",
			icon: IconHelp,
		},
	],
	services: [
		{
			name: "Boards",
			url: "/boards",
			icon: IconDatabase,
		},
		{
			name: "Roadmap",
			url: "/roadmap",
			icon: IconReport,
		},
		{
			name: "Changelog",
			url: "/changelog",
			icon: IconFileWord,
		},
	],
	insights: [
		{
			name: "Analytics",
			url: "/analytics",
			icon: IconChartBar,
		},
		{
			name: "Users",
			url: "/users",
			icon: IconUsers,
		},
	],
	settings: [
		{
			name: "Widget",
			url: "/widget",
			icon: IconCode,
		},
		{
			name: "Settings",
			url: "/settings",
			icon: IconSettings,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="#">
								<IconInnerShadowTop className="!size-5" />
								<span className="font-semibold text-base">Acme Inc.</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={data.services} heading={"Services"} />
				<NavDocuments items={data.insights} heading={"Insights"} />
				<NavDocuments items={data.settings} heading={"Workspace"} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
