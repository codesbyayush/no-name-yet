import { Check, ChevronLeft, ListFilter } from "lucide-react";
import * as React from "react";

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
import { cn } from "@/lib/utils";

export type FilterOption = {
	id: string;
	label: string;
	colorClass?: string; // tailwind color dot class
};

export type FilterCategory = {
	key: string; // e.g. "status" | "board" | "tag"
	label: string; // e.g. "Status"
	type: "multi" | "single";
	options: FilterOption[];
};

type FiltersProps = {
	categories: FilterCategory[];
	selected: Record<string, string[]>; // categoryKey -> selected option ids
	onChange: (categoryKey: string, values: string[]) => void;
	placeholder?: string;
};

export function Filters({
	categories,
	selected,
	onChange,
	placeholder = "Filters",
}: FiltersProps) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const [activeCategory, setActiveCategory] = React.useState<string | null>(
		null,
	);

	const active = categories.find((c) => c.key === activeCategory) || null;

	const activeCount = React.useMemo(() => {
		return Object.values(selected).reduce((sum, arr) => sum + arr.length, 0);
	}, [selected]);

	const toggleOption = (categoryKey: string, optionId: string) => {
		const category = categories.find((c) => c.key === categoryKey);
		if (!category) {
			return;
		}
		const current = new Set(selected[categoryKey] ?? []);
		if (category.type === "multi") {
			if (current.has(optionId)) {
				current.delete(optionId);
			} else {
				current.add(optionId);
			}
			onChange(categoryKey, Array.from(current));
		} else {
			onChange(categoryKey, current.has(optionId) ? [] : [optionId]);
			// For single select, auto-close the popover
			setOpen(false);
			setActiveCategory(null);
		}
	};

	const filteredCategories = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return categories;
		}
		// If searching on root, filter categories by label or contained option labels
		return categories.filter((cat) => {
			if (cat.label.toLowerCase().includes(q)) {
				return true;
			}
			return cat.options.some((o) => o.label.toLowerCase().includes(q));
		});
	}, [categories, query]);

	const filteredOptions = React.useMemo(() => {
		if (!active) {
			return [] as FilterOption[];
		}
		const q = query.trim().toLowerCase();
		if (!q) {
			return active.options;
		}
		return active.options.filter((o) => o.label.toLowerCase().includes(q));
	}, [active, query]);

	const triggerLabel =
		activeCount > 0 ? `${placeholder} (${activeCount})` : placeholder;

	return (
		<Popover
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) {
					setActiveCategory(null);
					setQuery("");
				}
			}}
		>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					role="combobox"
					aria-expanded={open}
					className="w-min items-center justify-start"
				>
					<ListFilter className="mr-2" />
					{triggerLabel}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[260px] p-0">
				<Command shouldFilter={false}>
					<div className="flex items-center gap-1 p-2">
						{active && (
							<button
								type="button"
								className="inline-flex items-center rounded-md p-1 text-muted-foreground hover:bg-accent"
								onClick={() => {
									setActiveCategory(null);
									setQuery("");
								}}
								aria-label="Back"
							>
								<ChevronLeft className="size-4" />
							</button>
						)}
						<CommandInput
							value={query}
							onValueChange={setQuery}
							placeholder={
								active ? `Search ${active.label}...` : "Search filter..."
							}
							className="h-9 flex-1"
						/>
					</div>
					<CommandList>
						<CommandEmpty>No results.</CommandEmpty>
						{!active ? (
							<CommandGroup>
								{filteredCategories.map((cat) => {
									return (
										<CommandItem
											key={cat.key}
											value={cat.key}
											onSelect={() => {
												setActiveCategory(cat.key);
												setQuery("");
											}}
										>
											<span className="truncate">{cat.label}</span>
											{selected[cat.key]?.length ? (
												<span className="ml-auto text-muted-foreground text-xs">
													{selected[cat.key].length}
												</span>
											) : null}
										</CommandItem>
									);
								})}
							</CommandGroup>
						) : (
							<CommandGroup>
								{filteredOptions.map((opt) => {
									const isSelected = (selected[active.key] ?? []).includes(
										opt.id,
									);
									return (
										<CommandItem
											key={opt.id}
											value={opt.id}
											onSelect={() => toggleOption(active.key, opt.id)}
										>
											<span
												className={cn(
													"mr-2 inline-flex size-4 items-center justify-center rounded-sm border",
													active.type === "multi"
														? isSelected
															? "border-primary bg-primary text-primary-foreground"
															: "border-muted-foreground/30"
														: "rounded-full border-muted-foreground/30",
												)}
											>
												{active.type === "multi" && isSelected ? (
													<Check className="size-3" />
												) : null}
											</span>
											{opt.colorClass ? (
												<span
													className={cn(
														"mr-2 inline-block size-2 rounded-full",
														opt.colorClass,
													)}
												/>
											) : null}
											<span className="truncate">{opt.label}</span>
											{active.type === "single" && isSelected ? (
												<Check className="ml-auto size-4" />
											) : null}
										</CommandItem>
									);
								})}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
