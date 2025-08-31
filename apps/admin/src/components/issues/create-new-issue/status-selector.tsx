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
import { status as allStatus } from "@/mock-data/status";
import { useIssues } from "@/react-db/issues";
import { CheckIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface StatusSelectorProps {
	statusKey: string;
	onChange: (statusId: string) => void;
}

export function StatusSelector({ statusKey, onChange }: StatusSelectorProps) {
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);
	const [value, setValue] = useState<string>(statusKey);

	const { data: issues } = useIssues();

	useEffect(() => {
		setValue(statusKey);
	}, [statusKey]);

	const handleStatusChange = (statusId: string) => {
		setValue(statusId);
		setOpen(false);

		onChange(statusId);
	};

	return (
		<div className="*:not-first:mt-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						className="flex items-center justify-center"
						size="sm"
						variant="secondary"
						role="combobox"
						aria-expanded={open}
					>
						{(() => {
							const selectedItem = allStatus.find((item) => item.id === value);
							if (selectedItem) {
								const Icon = selectedItem.icon;
								return <Icon />;
							}
							return null;
						})()}
						<span>
							{value ? allStatus.find((s) => s.id === value)?.name : "To do"}
						</span>
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
										onSelect={() => handleStatusChange(item.id)}
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
											{issues?.filter((is) => is.statusKey === item.id)
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
