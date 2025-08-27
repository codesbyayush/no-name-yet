import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useTags } from "@/hooks/use-tags";
import { priorities } from "@/mock-data/priorities";
import { projects } from "@/mock-data/projects";
import { status as allStatus } from "@/mock-data/status";
import { useFilterStore } from "@/store/filter-store";
import { useIssuesStore } from "@/store/issues-store";
import { useUsersStore } from "@/store/users-store";
import {
	BarChart3,
	CheckIcon,
	ChevronRight,
	CircleCheck,
	Folder,
	ListFilter,
	Tag,
	User,
} from "lucide-react";
import { useState } from "react";

// Define filter types
type FilterType = "status" | "assignee" | "priority" | "labels" | "project";

export function Filter() {
	const [open, setOpen] = useState<boolean>(false);
	const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);

	const { filters, toggleFilter, clearFilters, getActiveFiltersCount } =
		useFilterStore();

	const {
		filterByStatus,
		filterByAssignee,
		filterByPriority,
		filterByLabel,
		filterByProject,
	} = useIssuesStore();

	const { data: tags } = useTags();
	const { users } = useUsersStore();

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button size="sm" variant="ghost" className="relative">
					<ListFilter className="mr-1 size-4" />
					Filter
					{getActiveFiltersCount() > 0 && (
						<span className="-top-1 -right-1 absolute flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
							{getActiveFiltersCount()}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-60 p-0" align="start">
				{activeFilter === null ? (
					<Command>
						<CommandList>
							<CommandGroup>
								<CommandItem
									onSelect={() => setActiveFilter("status")}
									className="flex cursor-pointer items-center justify-between"
								>
									<span className="flex items-center gap-2">
										<CircleCheck className="size-4 text-muted-foreground" />
										Status
									</span>
									<div className="flex items-center">
										{filters.status.length > 0 && (
											<span className="mr-1 text-muted-foreground text-xs">
												{filters.status.length}
											</span>
										)}
										<ChevronRight className="size-4" />
									</div>
								</CommandItem>
								<CommandItem
									onSelect={() => setActiveFilter("assignee")}
									className="flex cursor-pointer items-center justify-between"
								>
									<span className="flex items-center gap-2">
										<User className="size-4 text-muted-foreground" />
										Assignee
									</span>
									<div className="flex items-center">
										{filters.assignee.length > 0 && (
											<span className="mr-1 text-muted-foreground text-xs">
												{filters.assignee.length}
											</span>
										)}
										<ChevronRight className="size-4" />
									</div>
								</CommandItem>
								<CommandItem
									onSelect={() => setActiveFilter("priority")}
									className="flex cursor-pointer items-center justify-between"
								>
									<span className="flex items-center gap-2">
										<BarChart3 className="size-4 text-muted-foreground" />
										Priority
									</span>
									<div className="flex items-center">
										{filters.priority.length > 0 && (
											<span className="mr-1 text-muted-foreground text-xs">
												{filters.priority.length}
											</span>
										)}
										<ChevronRight className="size-4" />
									</div>
								</CommandItem>
								<CommandItem
									onSelect={() => setActiveFilter("labels")}
									className="flex cursor-pointer items-center justify-between"
								>
									<span className="flex items-center gap-2">
										<Tag className="size-4 text-muted-foreground" />
										Labels
									</span>
									<div className="flex items-center">
										{filters.labels.length > 0 && (
											<span className="mr-1 text-muted-foreground text-xs">
												{filters.labels.length}
											</span>
										)}
										<ChevronRight className="size-4" />
									</div>
								</CommandItem>
								<CommandItem
									onSelect={() => setActiveFilter("project")}
									className="flex cursor-pointer items-center justify-between"
								>
									<span className="flex items-center gap-2">
										<Folder className="size-4 text-muted-foreground" />
										Project
									</span>
									<div className="flex items-center">
										{filters.project.length > 0 && (
											<span className="mr-1 text-muted-foreground text-xs">
												{filters.project.length}
											</span>
										)}
										<ChevronRight className="size-4" />
									</div>
								</CommandItem>
							</CommandGroup>
							{getActiveFiltersCount() > 0 && (
								<>
									<CommandSeparator />
									<CommandGroup>
										<CommandItem
											onSelect={() => clearFilters()}
											className="text-destructive"
										>
											Clear all filters
										</CommandItem>
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				) : activeFilter === "status" ? (
					<Command>
						<div className="flex items-center border-b p-2">
							<Button
								variant="ghost"
								size="icon"
								className="size-6"
								onClick={() => setActiveFilter(null)}
							>
								<ChevronRight className="size-4 rotate-180" />
							</Button>
							<span className="ml-2 font-medium">Status</span>
						</div>
						<CommandInput placeholder="Search status..." />
						<CommandList>
							<CommandEmpty>No status found.</CommandEmpty>
							<CommandGroup>
								{allStatus.map((item) => (
									<CommandItem
										key={item.id}
										value={item.id}
										onSelect={() => toggleFilter("status", item.id)}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<item.icon />
											{item.name}
										</div>
										{filters.status.includes(item.id) && (
											<CheckIcon size={16} className="ml-auto" />
										)}
										<span className="text-muted-foreground text-xs">
											{filterByStatus(item.id).length}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				) : activeFilter === "assignee" ? (
					<Command>
						<div className="flex items-center border-b p-2">
							<Button
								variant="ghost"
								size="icon"
								className="size-6"
								onClick={() => setActiveFilter(null)}
							>
								<ChevronRight className="size-4 rotate-180" />
							</Button>
							<span className="ml-2 font-medium">Assignee</span>
						</div>
						<CommandInput placeholder="Search assignee..." />
						<CommandList>
							<CommandEmpty>No assignees found.</CommandEmpty>
							<CommandGroup>
								<CommandItem
									value="unassigned"
									onSelect={() => toggleFilter("assignee", "unassigned")}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<User className="size-5" />
										Unassigned
									</div>
									{filters.assignee.includes("unassigned") && (
										<CheckIcon size={16} className="ml-auto" />
									)}
									<span className="text-muted-foreground text-xs">
										{filterByAssignee(null).length}
									</span>
								</CommandItem>
								{users.map((user) => (
									<CommandItem
										key={user.id}
										value={user.id}
										onSelect={() => toggleFilter("assignee", user.id)}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<Avatar className="size-5">
												<AvatarImage src={user.avatarUrl} alt={user.name} />
												<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
											</Avatar>
											{user.name}
										</div>
										{filters.assignee.includes(user.id) && (
											<CheckIcon size={16} className="ml-auto" />
										)}
										<span className="text-muted-foreground text-xs">
											{filterByAssignee(user.id).length}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				) : activeFilter === "priority" ? (
					<Command>
						<div className="flex items-center border-b p-2">
							<Button
								variant="ghost"
								size="icon"
								className="size-6"
								onClick={() => setActiveFilter(null)}
							>
								<ChevronRight className="size-4 rotate-180" />
							</Button>
							<span className="ml-2 font-medium">Priority</span>
						</div>
						<CommandInput placeholder="Search priority..." />
						<CommandList>
							<CommandEmpty>No priorities found.</CommandEmpty>
							<CommandGroup>
								{priorities.map((item) => (
									<CommandItem
										key={item.id}
										value={item.id}
										onSelect={() => toggleFilter("priority", item.id)}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<item.icon className="size-4 text-muted-foreground" />
											{item.name}
										</div>
										{filters.priority.includes(item.id) && (
											<CheckIcon size={16} className="ml-auto" />
										)}
										<span className="text-muted-foreground text-xs">
											{filterByPriority(item.id).length}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				) : activeFilter === "labels" ? (
					<Command>
						<div className="flex items-center border-b p-2">
							<Button
								variant="ghost"
								size="icon"
								className="size-6"
								onClick={() => setActiveFilter(null)}
							>
								<ChevronRight className="size-4 rotate-180" />
							</Button>
							<span className="ml-2 font-medium">Labels</span>
						</div>
						<CommandInput placeholder="Search labels..." />
						<CommandList>
							<CommandEmpty>No labels found.</CommandEmpty>
							<CommandGroup>
								{tags.map((tag) => (
									<CommandItem
										key={tag.id}
										value={tag.id}
										onSelect={() => toggleFilter("labels", tag.id)}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<span
												className="size-3 rounded-full"
												style={{ backgroundColor: tag.color }}
											/>
											{tag.name}
										</div>
										{filters.labels.includes(tag.id) && (
											<CheckIcon size={16} className="ml-auto" />
										)}
										<span className="text-muted-foreground text-xs">
											{filterByLabel(tag.id).length}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				) : activeFilter === "project" ? (
					<Command>
						<div className="flex items-center border-b p-2">
							<Button
								variant="ghost"
								size="icon"
								className="size-6"
								onClick={() => setActiveFilter(null)}
							>
								<ChevronRight className="size-4 rotate-180" />
							</Button>
							<span className="ml-2 font-medium">Project</span>
						</div>
						<CommandInput placeholder="Search projects..." />
						<CommandList>
							<CommandEmpty>No projects found.</CommandEmpty>
							<CommandGroup>
								{projects.map((project) => (
									<CommandItem
										key={project.id}
										value={project.id}
										onSelect={() => toggleFilter("project", project.id)}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<project.icon className="size-4" />
											{project.name}
										</div>
										{filters.project.includes(project.id) && (
											<CheckIcon size={16} className="ml-auto" />
										)}
										<span className="text-muted-foreground text-xs">
											{filterByProject(project.id).length}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				) : null}
			</PopoverContent>
		</Popover>
	);
}
