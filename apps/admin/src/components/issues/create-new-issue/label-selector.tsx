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
import { useTags } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";
import { useIssues } from "@/react-db/issues";
import type { Tag } from "@/store/tags-store";
import { CheckIcon, TagIcon } from "lucide-react";
import { useId, useState } from "react";

interface LabelSelectorProps {
	selectedLabels: Tag[];
	onChange: (labels: Tag[]) => void;
}

export function LabelSelector({
	selectedLabels,
	onChange,
}: LabelSelectorProps) {
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);

	const { data: issues } = useIssues();
	const { data: tags } = useTags();

	const handleLabelToggle = (tag: Tag) => {
		const isSelected = selectedLabels.some((l) => l.id === tag.id);
		let newLabels: Tag[];

		if (isSelected) {
			newLabels = selectedLabels.filter((l) => l.id !== tag.id);
		} else {
			newLabels = [...selectedLabels, tag];
		}

		onChange(newLabels);
	};

	return (
		<div className="*:not-first:mt-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						className={cn(
							"flex items-center justify-center",
							selectedLabels.length === 0 && "size-7",
						)}
						size={selectedLabels.length > 0 ? "sm" : "icon"}
						variant="secondary"
						role="combobox"
						aria-expanded={open}
					>
						<TagIcon className="size-4" />
						{selectedLabels.length > 0 && (
							<div className="-space-x-0.5 flex">
								{selectedLabels.map((tag) => (
									<div
										key={tag.id}
										className="size-3 rounded-full"
										style={{ backgroundColor: tag.color }}
									/>
								))}
							</div>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
					align="start"
				>
					<Command>
						<CommandInput placeholder="Search labels..." />
						<CommandList>
							<CommandEmpty>No labels found.</CommandEmpty>
							<CommandGroup>
								{tags.map((tag) => {
									const isSelected = selectedLabels.some(
										(l) => l.id === tag.id,
									);
									return (
										<CommandItem
											key={tag.id}
											value={tag.id}
											onSelect={() => handleLabelToggle(tag)}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												<div
													className="size-3 rounded-full"
													style={{ backgroundColor: tag.color }}
												/>
												<span>{tag.name}</span>
											</div>
											{isSelected && (
												<CheckIcon size={16} className="ml-auto" />
											)}
											<span className="text-muted-foreground text-xs">
												{issues?.filter((is) =>
													is.tags.some((l) => l.id === tag.id),
												).length ?? 0}
											</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
