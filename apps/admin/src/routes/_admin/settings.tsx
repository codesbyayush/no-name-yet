import { SiteHeader } from "@/components/site-header";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarRightPortal } from "@/contexts/sidebar-right";
import {
	IconApps,
	IconArrowUp,
	IconBook,
	IconBrandDiscord,
	IconBuilding,
	IconDownload,
	IconFileText,
	IconGlobe,
	IconMessageCircle,
	IconMoodSmile,
	IconPalette,
	IconProgress,
	IconSettings,
	IconShield,
	IconTags,
	IconUser,
	IconUsers,
	IconX,
} from "@tabler/icons-react";
import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
	useLocation,
} from "@tanstack/react-router";

type NavItem = {
	key: string;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
};
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
	{
		title: "General",
		items: [
			{ key: "team-members", label: "Team Members", icon: IconUsers },
			{ key: "pricing", label: "Pricing Plan", icon: IconArrowUp },
		],
	},
	{
		title: "Branding & Customizations",
		items: [
			{ key: "branding", label: "Branding", icon: IconPalette },
			{
				key: "notification-emails",
				label: "Notification Emails",
				icon: IconMessageCircle,
			},
			{ key: "modules", label: "Customize/disable modules", icon: IconApps },
			{ key: "custom-domains", label: "Custom Domains", icon: IconGlobe },
		],
	},
	{
		title: "Access & Authentication",
		items: [
			{ key: "org-access", label: "Organization Access", icon: IconBuilding },
			{ key: "auth-security", label: "Auth & security", icon: IconShield },
		],
	},
	{
		title: "Modules",
		items: [
			{ key: "support", label: "Support", icon: IconMoodSmile },
			{ key: "boards", label: "Feedback & Roadmap", icon: IconMessageCircle },
			{ key: "changelog", label: "Changelog", icon: IconFileText },
			{ key: "help-center", label: "Help Center", icon: IconBook },
		],
	},
	{
		title: "User data",
		items: [
			{ key: "user-tags", label: "User Tags", icon: IconTags },
			{ key: "banned-users", label: "Banned Users", icon: IconUser },
		],
	},
	{
		title: "Other",
		items: [
			{ key: "widgets", label: "Widgets & Embeds", icon: IconApps },
			{ key: "integrations", label: "Integrations", icon: IconDownload },
			{ key: "advanced", label: "Advanced", icon: IconProgress },
			{ key: "danger-zone", label: "Danger Zone", icon: IconX },
		],
	},
	{
		title: "Resources",
		items: [
			{ key: "docs", label: "Visit Developer Docs", icon: IconBook },
			{
				key: "discord",
				label: "Join our Discord community",
				icon: IconBrandDiscord,
			},
		],
	},
];

export const Route = createFileRoute("/_admin/settings")({
	beforeLoad: ({ location }) => {
		// Redirect bare /settings to default child route
		if (
			location.pathname === "/settings" ||
			location.pathname === "/settings/"
		) {
			throw redirect({ to: "/settings/boards", replace: true });
		}
	},
	component: SettingsLayout,
});

function SettingsLayout() {
	const location = useLocation();

	return (
		<div>
			<div className="sticky top-0 z-20 bg-background">
				<div className="border-muted border-b-[1px] pl-2">
					<SiteHeader title="Settings" />
				</div>
			</div>
			<SidebarRightPortal>
				<div className="space-y-4 px-2 py-2">
					{navGroups.map((group) => (
						<div key={group.title}>
							<div className="px-1 pt-1 pb-2 text-muted-foreground text-sm">
								{group.title}
							</div>
							<SidebarMenu>
								{group.items.map((item) => {
									const Icon = item.icon ?? IconSettings;
									const href = `/settings/${item.key}`;
									const isActive = location.pathname.startsWith(href);
									return (
										<SidebarMenuItem key={item.key}>
											<SidebarMenuButton asChild isActive={isActive}>
												<Link to={href}>
													<Icon className="size-4" />
													<span className="text-sm">{item.label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</div>
					))}
				</div>
			</SidebarRightPortal>
			<div className="px-4 py-3">
				<div className="mx-auto w-full max-w-6xl">
					<div className="space-y-6">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}
