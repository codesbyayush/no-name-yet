import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { client } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface PostFormData {
	title: string;
	description: string;
	board: string;
}

interface CreateEditPostProps {
	boardId: string;
	trigger?: React.ReactNode;
	post?: any; // Existing post for editing
	mode?: "create" | "edit";
	onSuccess?: () => void;
}

export function CreateEditPost({
	boardId,
	trigger,
	post,
	mode = "create",
	onSuccess,
}: CreateEditPostProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [newTag, setNewTag] = useState("");

	const [formData, setFormData] = useState<PostFormData>({
		title: "",
		description: "",
		board: "",
	});

	// Pre-fill form data when editing
	useEffect(() => {
		if (post && mode === "edit") {
			setFormData({
				title: post.title || "",
				description: post.description || "",
				board: post.boardId,
			});
		}
	}, [post, mode]);

	// Reset form when modal closes
	useEffect(() => {
		if (!open && mode === "create") {
			setFormData({
				title: "",
				description: "",
				board: boards?.boards[0]?.id || "",
			});
			setNewTag("");
		}
	}, [open, mode /* eslint-disable-line react-hooks/exhaustive-deps */]);

	// Create post mutation
	const createPostMutation = useMutation({
		mutationFn: (data: PostFormData) =>
			client.public.posts.create({
				boardId: data.board,
				type: "suggestion",
				...data,
			}),
		onSuccess: () => {
			toast.success("Post created successfully!");
			queryClient.invalidateQueries({ queryKey: ["boardPosts", boardId] });
			setOpen(false);
			onSuccess?.();
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to create post");
		},
	});

	const { data: boards } = useQuery({
		queryKey: ["public-boards"],
		queryFn: () => client.getAllPublicBoards(),
	});

	const selectedBoardName = useMemo(
		() => boards?.boards.find((b) => b.id === formData.board)?.name,
		[boards, formData.board],
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (!formData.description.trim()) {
			toast.error("Please enter a description");
			return;
		}

		if (mode === "create") {
			createPostMutation.mutate(formData);
		} else {
			// TODO: Handle edit mode when update mutation is available
			toast.error("Edit functionality not yet implemented");
		}
	};

	const isLoading = createPostMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button className="h-10 w-full rounded-xl bg-primary p-0 font-medium text-base shadow-sm hover:bg-primary/90">
						{mode === "create" ? "Submit a post" : "Edit post"}
					</Button>
				)}
			</DialogTrigger>
			{/* Linear-like frosted panel with subtle gradient, no visible borders */}
			<DialogContent className="max-h-[90vh] w-[820px] max-w-[95vw] overflow-y-auto rounded-2xl border-0 bg-gradient-to-br from-background/70 to-background/40 p-0 shadow-2xl backdrop-blur-2xl">
				<DialogHeader className="px-6 pt-6 pb-0">
					<DialogTitle className="font-semibold text-[15px] text-muted-foreground">
						{mode === "create" ? "New issue" : "Edit issue"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="px-6 pt-2">
					{/* Title — borderless, no label, large placeholder */}
					<div className="space-y-1">
						<Input
							id="title"
							value={formData.title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
							placeholder="Issue title"
							maxLength={250}
							required
							className="h-16 rounded-2xl border-0 bg-transparent px-0 font-semibold text-2xl text-foreground leading-tight tracking-[-0.01em] shadow-none outline-none ring-0 placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-0 dark:bg-transparent"
						/>
					</div>

					{/* Description — borderless, no label, subtle guide text */}
					<div className="space-y-2">
						<AutosizeTextarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Add a clear description, steps, and context"
							maxLength={5000}
							minHeight={100}
							required
							className="rounded-2xl border-0 bg-transparent px-2 py-3 text-base text-foreground leading-6 shadow-none outline-none ring-0 ring-transparent placeholder:text-foreground/40 focus-within:ring-0 focus-visible:outline-none focus-visible:ring-0 dark:ring-transparent dark:focus-within:ring-0"
						/>
					</div>

					{/* Character counter — subtle, aligns to Linear minimalism */}
					<div className="mt-1 text-right text-muted-foreground/60 text-xs">
						{formData.description.length}/5000
					</div>
				</form>

				{/* Bottom action bar — pill buttons that open dropdowns */}
				<div className="px-6">
					<div className="flex flex-wrap items-center gap-2">
						{/* Board picker */}
						<Select
							value={formData.board}
							onValueChange={(value: string) =>
								setFormData((prev) => ({ ...prev, board: value }))
							}
						>
							<SelectTrigger className="h-9 rounded-full border-0 bg-foreground/[0.04] px-3 font-medium text-foreground text-sm shadow-none backdrop-blur-sm transition-colors hover:bg-foreground/[0.06] focus:ring-0 focus-visible:ring-0">
								<SelectValue
									placeholder="Select board"
									className="text-foreground"
								>
									{selectedBoardName || "Select board"}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-xl border border-muted-foreground/10 bg-popover p-1 shadow-2xl">
								{boards?.boards.map((board) => (
									<SelectItem
										key={board.id}
										value={board.id}
										className="cursor-pointer rounded-lg text-sm"
									>
										{board.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Placeholder pills (non-functional for now, mainly for admin visits) */}
						{/* <Button
							type="button"
							variant="ghost"
							className="h-9 rounded-full bg-foreground/[0.04] px-3 font-medium text-foreground text-sm hover:bg-foreground/[0.06]"
						>
							Priority
						</Button>
						<Button
							type="button"
							variant="ghost"
							className="h-9 rounded-full bg-foreground/[0.04] px-3 font-medium text-foreground text-sm hover:bg-foreground/[0.06]"
						>
							Assignee
						</Button>
						<Button
							type="button"
							variant="ghost"
							className="h-9 rounded-full bg-foreground/[0.04] px-3 font-medium text-foreground text-sm hover:bg-foreground/[0.06]"
						>
							Labels
						</Button> */}

						<div className="ml-auto" />
					</div>
				</div>

				<DialogFooter className="sticky bottom-0 z-10 gap-3 border-muted border-t bg-gradient-to-t from-background/40 to-transparent px-6 py-3 backdrop-blur-md">
					<Button
						type="button"
						variant="ghost"
						onClick={() => setOpen(false)}
						disabled={isLoading}
						className="h-9 rounded-xl px-4 text-foreground text-sm hover:bg-foreground/[0.06]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						onClick={handleSubmit}
						disabled={
							isLoading ||
							!formData.title.trim() ||
							!formData.description.trim()
						}
						className="h-9 rounded-xl bg-primary px-5 font-semibold text-sm shadow-sm hover:bg-primary/90"
					>
						{isLoading ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
								{mode === "create" ? "Creating..." : "Updating..."}
							</>
						) : mode === "create" ? (
							"Create issue"
						) : (
							"Update issue"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
