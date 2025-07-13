import type React from "react";
import { useEffect, useRef, useState } from "react";
import { type Board, type FeedbackSubmission, createApiClient } from "./api";

interface OmniFeedbackWidgetProps {
	publicKey: string;
	boardId?: string;
	user?: {
		id?: string;
		name?: string;
		email?: string;
	};
	customData?: { [key: string]: string };
	apiUrl?: string;
	theme?: {
		primaryColor?: string;
		buttonText?: string;
	};
	position?: "center" | "above-button";
	onClose?: () => void;
}

const OmniFeedbackWidget: React.FC<OmniFeedbackWidgetProps> = ({
	publicKey,
	boardId,
	user,
	customData,
	apiUrl = "https://localhost:8080",
	theme = {},
	position = "above-button",
	onClose,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState<
		"type" | "details" | "submit" | "success"
	>("type");

	// State for feedback content
	const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion">("bug");
	const [description, setDescription] = useState("");
	const [severity, setSeverity] = useState<
		"low" | "medium" | "high" | "critical"
	>("medium");

	// State for board selection
	const [boards, setBoards] = useState<Board[]>([]);
	const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>(
		boardId,
	);
	const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(!boardId);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const [apiClient] = useState(() => createApiClient({ apiUrl, publicKey }));
	console.log(publicKey);

	useEffect(() => {
		// If no boardId is provided, fetch the public boards for the user to choose from.
		if (!boardId) {
			setIsLoadingBoards(true);
			setError(null);
			apiClient
				.getPublicBoards()
				.then((fetchedBoards) => {
					setBoards(fetchedBoards);
					if (fetchedBoards && fetchedBoards.length > 0) {
						setSelectedBoardId(fetchedBoards[0].id);
					} else {
						setError("No public boards are available.");
					}
				})
				.catch(() => {
					setError("Could not load boards. Please check your public key.");
				})
				.finally(() => {
					setIsLoadingBoards(false);
				});
		}
	}, [boardId, apiClient]);

	// Collect browser context
	const getBrowserContext = () => ({
		userAgent: navigator.userAgent,
		url: window.location.href,
		timestamp: new Date().toISOString(),
		viewport: {
			width: window.innerWidth,
			height: window.innerHeight,
		},
	});

	const handleTypeSelection = (type: "bug" | "suggestion") => {
		setFeedbackType(type);
		setCurrentStep("details");
	};

	// const handleFileUpload = (files: FileList | null) => {
	//   if (files) {
	//     const fileArray = Array.from(files);
	//     setFeedbackData((prev) => ({ ...prev, attachments: fileArray }));
	//   }
	// };

	const submitFeedback = async () => {
		if (!description.trim()) {
			setError("Please provide a description.");
			return;
		}
		if (!selectedBoardId) {
			setError("Please select a board.");
			return;
		}

		setIsSubmitting(true);
		setError(null);

		const browserContext = getBrowserContext();

		const submission: FeedbackSubmission = {
			boardId: selectedBoardId,
			type: feedbackType,
			description,
			severity: feedbackType === "bug" ? severity : undefined,
			user,
			customData,
			browserInfo: {
				userAgent: browserContext.userAgent,
				url: browserContext.url,
				platform: navigator.platform,
				language: navigator.language,
				cookieEnabled: navigator.cookieEnabled,
				onLine: navigator.onLine,
				screenResolution: `${window.screen.width}x${window.screen.height}`,
			},
		};

		try {
			const result = await apiClient.submitFeedback(submission);
			if (result.success) {
				setCurrentStep("success");
			} else {
				throw new Error("Submission was not successful.");
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to submit feedback",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetWidget = () => {
		setCurrentStep("type");
		setDescription("");
		setFeedbackType("bug");
		setSeverity("medium");
		setError(null);
		setIsSubmitting(false);
	};

	const closeWidget = () => {
		setIsOpen(false);
		resetWidget();
		onClose?.();
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case "type":
				return (
					<div className="fade-in animate-in duration-200">
						<h3 className="mb-5 font-semibold text-gray-900 text-lg">
							How can we help you today?
						</h3>
						<div className="flex flex-col gap-3">
							<button
								className="flex cursor-pointer flex-col gap-2 rounded-lg border-2 border-gray-200 bg-white p-5 text-left transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								onClick={() => handleTypeSelection("bug")}
							>
								<span className="mb-1 text-2xl">🐛</span>
								<span className="font-medium">Report a Bug</span>
								<span className="mt-1 text-gray-500 text-xs">
									Something isn't working as expected
								</span>
							</button>
							<button
								className="flex cursor-pointer flex-col gap-2 rounded-lg border-2 border-gray-200 bg-white p-5 text-left transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								onClick={() => handleTypeSelection("suggestion")}
							>
								<span className="mb-1 text-2xl">💡</span>
								<span className="font-medium">Suggest Improvement</span>
								<span className="mt-1 text-gray-500 text-xs">
									Share ideas for better processes or tools
								</span>
							</button>
						</div>
					</div>
				);

			case "details":
				return (
					<div className="fade-in animate-in duration-200">
						<h3 className="mb-5 font-semibold text-gray-900 text-lg">
							{feedbackType === "bug"
								? "Describe the issue"
								: "Share your suggestion"}
						</h3>

						{!boardId && ( // Only show board selector if no specific board was passed in
							<div className="mb-5">
								<label
									htmlFor="board-select"
									className="mb-2 block font-medium text-gray-700"
								>
									Select a Board
								</label>
								{isLoadingBoards ? (
									<div className="w-full animate-pulse rounded-md border-2 border-gray-200 bg-gray-100 p-3">
										Loading boards...
									</div>
								) : (
									<select
										id="board-select"
										className="w-full rounded-md border-2 border-gray-200 p-3 font-inherit text-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
										value={selectedBoardId}
										onChange={(e) => setSelectedBoardId(e.target.value)}
										disabled={boards.length === 0}
									>
										{boards.length === 0 && (
											<option>No boards available</option>
										)}
										{boards.map((b) => (
											<option key={b.id} value={b.id}>
												{b.name}
											</option>
										))}
									</select>
								)}
							</div>
						)}

						<textarea
							className="mb-5 min-h-[100px] w-full resize-y rounded-md border-2 border-gray-200 p-3 font-inherit text-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
							placeholder={
								feedbackType === "bug"
									? "Please describe what happened and what you expected..."
									: "Tell us about your improvement idea..."
							}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={4}
						/>

						{feedbackType === "bug" && (
							<div className="mb-5">
								<label className="mb-2 block font-medium text-gray-700">
									How urgent is this issue?
								</label>
								<div className="flex flex-wrap gap-2">
									{(["low", "medium", "high", "critical"] as const).map((s) => (
										<button
											key={s}
											className={`cursor-pointer rounded-full border-2 px-4 py-2 font-medium text-xs capitalize transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
												severity === s
													? "border-blue-500 bg-blue-500 text-white"
													: "border-gray-200 bg-white text-gray-700 hover:border-blue-500"
											}`}
											onClick={() => setSeverity(s)}
										>
											{s.charAt(0).toUpperCase() + s.slice(1)}
										</button>
									))}
								</div>
							</div>
						)}

						{/* File upload commented out */}

						{error && (
							<div className="mb-4 rounded-md border border-red-200 bg-red-100 p-3 text-red-800 text-sm">
								{error}
							</div>
						)}

						<div className="mt-6 flex justify-end gap-3">
							<button
								className="min-w-[100px] cursor-pointer rounded-md border border-gray-200 bg-gray-100 px-6 py-3 font-medium text-gray-700 text-sm transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								onClick={() => setCurrentStep("type")}
							>
								Back
							</button>
							<button
								className="min-w-[100px] cursor-pointer rounded-md border-none bg-blue-500 px-6 py-3 font-medium text-sm text-white transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-500"
								onClick={submitFeedback}
								disabled={
									isSubmitting ||
									!description.trim() ||
									isLoadingBoards ||
									!selectedBoardId
								}
							>
								{isSubmitting ? "Submitting..." : "Submit Feedback"}
							</button>
						</div>
					</div>
				);

			case "success":
				return (
					<div className="fade-in animate-in duration-200">
						<div className="py-5 text-center">
							<div className="mb-4 text-5xl">✅</div>
							<h3 className="mb-3 font-semibold text-green-600 text-lg">
								Thank you for your feedback!
							</h3>
							<p className="mb-6 text-gray-500 leading-relaxed">
								We've received your{" "}
								{feedbackType === "bug" ? "bug report" : "suggestion"} and will
								review it soon.
							</p>
							<button
								className="min-w-[100px] cursor-pointer rounded-md border-none bg-blue-500 px-6 py-3 font-medium text-sm text-white transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								onClick={closeWidget}
							>
								Done
							</button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="omni-feedback-widget fixed z-[999999] font-sans text-gray-800 text-sm leading-relaxed">
			{/* Floating Action Button */}
			<button
				className="fixed right-5 bottom-5 z-[1000000] flex h-15 w-15 cursor-pointer items-center justify-center rounded-full border-none shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				style={{ backgroundColor: theme.primaryColor || "#007bff" }}
				onClick={() => setIsOpen(!isOpen)}
				aria-label={isOpen ? "Close feedback widget" : "Open feedback widget"}
			>
				<span className="text-2xl text-white">💬</span>
			</button>

			{/* Widget Modal */}
			{isOpen && (
				<>
					{position === "center" ? (
						<div className="fixed inset-0 z-[1000001] flex items-center justify-center p-5">
							<div className="zoom-in-95 fade-in max-h-[90vh] w-full max-w-lg animate-in overflow-hidden rounded-xl bg-white shadow-2xl duration-300">
								<div className="flex items-center justify-between border-gray-200 border-b p-5 pb-4">
									<h2 className="m-0 font-semibold text-gray-900 text-xl">
										Feedback
									</h2>
									<button
										className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-none bg-none p-0 text-2xl text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
										onClick={closeWidget}
										aria-label="Close"
									>
										×
									</button>
								</div>
								<div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
									{renderStepContent()}
								</div>
							</div>
						</div>
					) : (
						<div className="fixed right-5 bottom-20 z-[1000001] w-96 max-w-[calc(100vw-40px)]">
							<div className="zoom-in-95 fade-in max-h-[calc(100vh-140px)] animate-in overflow-hidden rounded-xl bg-white shadow-2xl duration-300">
								<div className="flex items-center justify-between border-gray-200 border-b p-5 pb-4">
									<h2 className="m-0 font-semibold text-gray-900 text-xl">
										Feedback
									</h2>
									<button
										className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-none bg-none p-0 text-2xl text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
										onClick={closeWidget}
										aria-label="Close"
									>
										×
									</button>
								</div>
								<div className="max-h-[calc(100vh-220px)] overflow-y-auto p-6">
									{renderStepContent()}
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default OmniFeedbackWidget;
