import {
	BoardsSettings,
	FeedbackSettings,
	GeneralSettings,
} from "@/components/admin/settings";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	IconApps,
	IconArrowUp,
	IconBuilding,
	IconClock,
	IconDownload,
	IconFileText,
	IconGlobe,
	IconMessageCircle,
	IconMoodSmile,
	IconPalette,
	IconProgress,
	IconSettings,
	IconUser,
	IconUsers,
	IconX,
} from "@tabler/icons-react";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/_admin/settings/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		tab: (search.tab as string) || "general",
	}),
});

interface SettingsSection {
	id: string;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	component: React.ComponentType;
	description?: string;
}

const settingsSections: SettingsSection[] = [
	{
		id: "general",
		title: "General",
		icon: IconSettings,
		component: GeneralSettings,
		description: "Manage your workspace settings and preferences.",
	},
	{
		id: "boards",
		title: "Boards",
		icon: IconBuilding,
		component: BoardsSettings,
		description: "Configure your boards, tags, and submission settings.",
	},
];

import { ChangelogSettings } from "@/components/admin/settings/changelog-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
const tabs = [
	{
		name: "feedback",
		value: "feedback",
		content: <FeedbackSettings />,
		component: FeedbackSettings,
	},
	{
		name: "changelog",
		value: "changelog",
		content: <ChangelogSettings />,
		component: ChangelogSettings,
	},
	{
		name: "branding",
		value: "branding",
		content: <BoardsSettings />,
		component: BoardsSettings,
	},
];

function RouteComponent() {
	return (
		<div>
			<div className="sticky top-0 z-20 bg-background">
				<div className="border-muted border-b-[1px] pl-2">
					<SiteHeader title="Settings" />
				</div>
			</div>
			<div className="px-4 py-3">
				<div className="flex h-screen flex-col">
					<Tabs
						defaultValue={tabs[0].value}
						className="flex w-full flex-col items-start justify-center px-6 sm:px-10"
					>
						<TabsList className="inline-flex h-9 w-full items-center justify-start rounded-none bg-transparent p-0 text-muted-foreground">
							{tabs.map((tab) => (
								<TabsTrigger
									key={tab.value}
									value={tab.value}
									className="relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-1 pt-2 pb-3 font-semibold text-muted-foreground text-sm shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
								>
									<code className="text-sm">{tab.name}</code>
								</TabsTrigger>
							))}
						</TabsList>
						{tabs.map((tab) => (
							<TabsContent
								key={tab.value}
								value={tab.value}
								className="mx-auto w-full max-w-5xl"
							>
								<div className="space-y-6">
									<tab.component />
								</div>
							</TabsContent>
						))}
					</Tabs>
				</div>
			</div>
		</div>
	);
}
