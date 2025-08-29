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
import { renderStatusIcon } from "@/lib/status-utils";
import { status as allStatus } from "@/mock-data/status";
import { useUpdateIssue } from "@/react-db/issues";
import { CheckIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface StatusSelectorProps {
	issueId: string;
	statusKey?: string;
}

export function StatusSelector({ issueId, statusKey }: StatusSelectorProps) {
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);
	const [value, setValue] = useState<string>(statusKey || "to-do");
	const { mutate } = useUpdateIssue();

	useEffect(() => {
		if (statusKey) {
			setValue(statusKey);
		}
	}, [statusKey]);

	const handleStatusChange = (statusId: string) => {
		setValue(statusId);
		setOpen(false);

		if (issueId) {
			const newStatus = allStatus.find((s) => s.id === statusId);
			if (newStatus) {
				mutate(issueId, { statusKey: newStatus.key });
			}
		}
	};

	return (
		<div className="*:not-first:mt-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						className="flex size-7 items-center justify-center"
						size="icon"
						variant="ghost"
						role="combobox"
						aria-expanded={open}
					>
						{renderStatusIcon(value)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
					align="start"
				>
					<Command>
						<CommandInput placeholder="Set status..." />
						<CommandList>
							<CommandEmpty>No status found.</CommandEmpty>
							<CommandGroup>
								{allStatus.map((item) => (
									<CommandItem
										key={item.id}
										value={item.id}
										onSelect={handleStatusChange}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<item.icon />
											{item.name}
										</div>
										{value === item.id && (
											<CheckIcon size={16} className="ml-auto" />
										)}
										<span className="text-muted-foreground text-xs">
											{/* {filterByStatus(item.id).length} */}
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
