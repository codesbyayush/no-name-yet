import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateIssue } from "@/react-db/issues";
import {
	type User,
	statusUserColors,
	useUsersStore,
} from "@/store/users-store";
import { CheckIcon, CircleUserRound, Send, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface AssigneeUserProps {
	userId?: string;
	issueId: string;
}

export function AssigneeUser({ userId, issueId }: AssigneeUserProps) {
	const [open, setOpen] = useState(false);
	const [currentAssignee, setCurrentAssignee] = useState<User | null>(null);
	const { users } = useUsersStore();
	const { mutate } = useUpdateIssue();
	const currUser = users.find((u) => u.id === userId);
	useEffect(() => {
		if (currUser) {
			setCurrentAssignee(currUser);
		}
	}, [currUser]);

	const renderAvatar = () => {
		if (currentAssignee) {
			return (
				<Avatar className="size-6 shrink-0">
					<AvatarImage
						src={currentAssignee.avatarUrl}
						alt={currentAssignee.name}
					/>
					<AvatarFallback>{currentAssignee.name[0]}</AvatarFallback>
				</Avatar>
			);
		} else {
			return (
				<div className="flex size-6 items-center justify-center">
					<CircleUserRound className="size-5 text-zinc-600" />
				</div>
			);
		}
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<button className="relative w-fit focus:outline-none">
					{renderAvatar()}
					{currentAssignee && (
						<span
							className="-end-0.5 -bottom-0.5 absolute size-2.5 rounded-full border-2 border-background"
							style={{
								backgroundColor: statusUserColors[currentAssignee.status],
							}}
						>
							<span className="sr-only">{currentAssignee.status}</span>
						</span>
					)}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-[206px]">
				<DropdownMenuLabel>Assign to...</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						setCurrentAssignee(null);
						mutate(issueId, { assignee: null });
						setOpen(false);
					}}
				>
					<div className="flex items-center gap-2">
						<UserIcon className="h-5 w-5" />
						<span>No assignee</span>
					</div>
					{!currentAssignee && <CheckIcon className="ml-auto h-4 w-4" />}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				{users.map((user) => (
					<DropdownMenuItem
						key={user.id}
						onClick={(e) => {
							e.stopPropagation();
							setCurrentAssignee(user);
							mutate(issueId, {
								assignee: {
									id: user.id,
									name: user.name,
									email: user.email,
									avatarUrl: user.avatarUrl,
									status: user.status,
									role: user.role,
									joinedDate: user.joinedDate,
									teamIds: user.teamIds,
								},
							});
							setOpen(false);
						}}
					>
						<div className="flex items-center gap-2">
							<Avatar className="h-5 w-5">
								<AvatarImage src={user.avatarUrl} alt={user.name} />
								<AvatarFallback>{user.name[0]}</AvatarFallback>
							</Avatar>
							<span>{user.name}</span>
						</div>
						{currentAssignee?.id === user.id && (
							<CheckIcon className="ml-auto h-4 w-4" />
						)}
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuLabel>New user</DropdownMenuLabel>
				<DropdownMenuItem>
					<div className="flex items-center gap-2">
						<Send className="h-4 w-4" />
						<span>Invite and assign...</span>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
