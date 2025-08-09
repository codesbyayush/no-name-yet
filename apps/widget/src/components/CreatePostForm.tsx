import { useEffect, useMemo, useRef, useState } from "react";
import { type ApiClient, type Board, createApiClient } from "../api";

interface CreatePostFormProps {
	publicKey: string;
	apiUrl: string;
	defaultBoardId?: string;
	onSuccess?: () => void;
}

interface PostFormState {
	title: string;
	description: string;
	board: string;
}

export default function CreatePostForm({
	publicKey,
	apiUrl,
	defaultBoardId,
	onSuccess,
}: CreatePostFormProps) {
	const apiClient = useRef<ApiClient>(createApiClient({ apiUrl, publicKey }));

	const [boards, setBoards] = useState<Board[]>([]);
	const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isBoardOpen, setIsBoardOpen] = useState(false);
	const boardDropdownRef = useRef<HTMLDivElement | null>(null);

	const [form, setForm] = useState<PostFormState>({
		title: "",
		description: "",
		board: defaultBoardId || "",
	});

	useEffect(() => {
		let mounted = true;
		setIsLoadingBoards(true);
		apiClient.current
			.getPublicBoardsCached()
			.then((data) => {
				if (!mounted) return;
				setBoards(data);
				if (!form.board) {
					setForm((prev) => ({
						...prev,
						board: defaultBoardId || data[0]?.id || "",
					}));
				}
			})
			.catch(() => setError("Failed to load boards"))
			.finally(() => setIsLoadingBoards(false));
		return () => {
			mounted = false;
		};
	}, [defaultBoardId]);

	const selectedBoardName = useMemo(
		() => boards.find((b) => b.id === form.board)?.name,
		[boards, form.board],
	);

	useEffect(() => {
		const onDocMouseDown = (e: MouseEvent) => {
			if (
				boardDropdownRef.current &&
				!boardDropdownRef.current.contains(e.target as Node)
			) {
				setIsBoardOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsBoardOpen(false);
		};
		document.addEventListener("mousedown", onDocMouseDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDocMouseDown);
			document.removeEventListener("keydown", onKey);
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!form.title.trim()) {
			setError("Please enter a title");
			return;
		}
		if (!form.description.trim()) {
			setError("Please enter a description");
			return;
		}
		if (!form.board) {
			setError("Please select a board");
			return;
		}

		setIsSubmitting(true);
		try {
			// Use the widget public feedback API. We concatenate title + description to keep payload small/compatible

			// TODO: add type to the description - hardcoded suggestion for now
			const combinedDescription = `${form.title}\n\n${form.description}`;
			await apiClient.current.submitFeedback({
				boardId: form.board,
				type: "suggestion",
				description: combinedDescription,
				browserInfo: {
					userAgent: navigator.userAgent,
					url: window.location.href,
					language: navigator.language,
					platform: navigator.platform,
					cookieEnabled: navigator.cookieEnabled,
					onLine: navigator.onLine,
					screenResolution: `${window.screen.width}x${window.screen.height}`,
				},
			});
			onSuccess?.();
			setForm({
				title: "",
				description: "",
				board: defaultBoardId || boards[0]?.id || "",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create post");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex h-full flex-col">
			<div className="p-5">
				<div className="space-y-1">
					<input
						type="text"
						value={form.title}
						onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
						placeholder="Issue title"
						maxLength={250}
						required
						className="w-full rounded-xl border border-gray-200 px-3 py-3 font-medium text-base focus:border-blue-500 focus:outline-none"
					/>
				</div>
				<div className="mt-3 space-y-2">
					<textarea
						value={form.description}
						onChange={(e) =>
							setForm((p) => ({ ...p, description: e.target.value }))
						}
						placeholder="Add a clear description, steps, and context"
						maxLength={5000}
						rows={5}
						required
						className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none"
					/>
					<div className="text-right text-gray-500 text-xs">
						{form.description.length}/5000
					</div>
				</div>
				<div className="mt-4 flex items-center justify-between gap-2">
					<div className="relative" ref={boardDropdownRef}>
						<button
							type="button"
							onClick={() => {
								if (isBoardOpen) {
									setIsBoardOpen(false);
								} else {
									setIsBoardOpen(true);
								}
							}}
							disabled={isLoadingBoards || boards.length === 0}
							aria-haspopup="listbox"
							aria-expanded={isBoardOpen}
							className="flex min-w-[12rem] items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
						>
							<span className="truncate">
								{selectedBoardName || boards[0]?.name || "Select board"}
							</span>
							<span className="ml-2 text-gray-500">▾</span>
						</button>
						{isBoardOpen && (
							<div
								className={
									"absolute bottom-full left-0 z-[1000002] mb-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
								}
							>
								<div className="max-h-60 overflow-auto py-1">
									{boards.map((b) => (
										<button
											key={b.id}
											type="button"
											onClick={() => {
												setForm((p) => ({ ...p, board: b.id }));
												setIsBoardOpen(false);
											}}
											className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 ${form.board === b.id ? "bg-gray-50" : ""}`}
										>
											<span className="truncate">{b.name}</span>
											{form.board === b.id ? (
												<span className="ml-2 text-blue-600">✓</span>
											) : null}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
					<button
						type="submit"
						disabled={
							isSubmitting ||
							!form.title.trim() ||
							!form.description.trim() ||
							!form.board
						}
						className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{isSubmitting ? "Creating..." : "Create issue"}
					</button>
				</div>
				{error && (
					<div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
						{error}
					</div>
				)}
			</div>
		</form>
	);
}
