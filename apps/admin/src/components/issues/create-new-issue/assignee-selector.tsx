"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useIssues } from "@/react-db/issues";
import { useUsers } from "@/react-db/users";
import type { User } from "@/store/users-store";
import { CheckIcon, UserCircle } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface AssigneeSelectorProps {
	assigneeId: string | undefined;
	onChange: (assignee?: string) => void;
}

export function AssigneeSelector({
	assigneeId,
	onChange,
}: AssigneeSelectorProps) {
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);
	const [value, setValue] = useState<string | null>(assigneeId || null);

	const { data: issues } = useIssues();
	const { data: users } = useUsers();

	useEffect(() => {
		setValue(assigneeId || null);
	}, [assigneeId]);

	const handleAssigneeChange = (userId: string) => {
		if (userId === "unassigned") {
			setValue(null);
			onChange();
		} else {
			setValue(userId);
			const newAssignee = users?.find((u) => u.id === userId) || null;
			if (newAssignee) {
				onChange(newAssignee.id);
			}
		}
		setOpen(false);
	};

	return (
		<div className="*:not-first:mt-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						className="flex items-center justify-center capitalize"
						size="sm"
						variant="secondary"
						role="combobox"
						aria-expanded={open}
					>
						{value ? (
							(() => {
								const selectedUser = users?.find((user) => user.id === value);
								if (selectedUser) {
									return (
										<Avatar className="size-5">
											<AvatarImage
												src={selectedUser.image || ""}
												alt={selectedUser.name}
											/>
											<AvatarFallback>
												{selectedUser.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
									);
								}
								return <UserCircle className="size-5" />;
							})()
						) : (
							<UserCircle className="size-5" />
						)}
						<span>
							{value
								? users?.find((user) => user.id === value)?.name
								: "Unassigned"}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
					align="start"
				>
					<Command>
						<CommandInput placeholder="Assign to..." />
						<CommandList>
							<CommandEmpty>No users found.</CommandEmpty>
							<CommandGroup>
								<CommandItem
									value="unassigned"
									onSelect={() => handleAssigneeChange("unassigned")}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<UserCircle className="size-5" />
										Unassigned
									</div>
									{value === null && (
										<CheckIcon size={16} className="ml-auto" />
									)}
									<span className="text-muted-foreground text-xs">
										{issues?.filter((is) => is.assignee === null).length ?? 0}
									</span>
								</CommandItem>
								{(users ?? []).map((user) => (
									<CommandItem
										key={user.id}
										value={user.id}
										onSelect={() => handleAssigneeChange(user.id)}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2 capitalize">
											<Avatar className="size-5">
												<AvatarImage src={user.image || ""} alt={user.name} />
												<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
											</Avatar>
											{user.name}
										</div>
										{value === user.id && (
											<CheckIcon size={16} className="ml-auto" />
										)}
										<span className="text-muted-foreground text-xs">
											{issues?.filter((is) => is.assignee?.id === user.id)
												.length ?? 0}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
