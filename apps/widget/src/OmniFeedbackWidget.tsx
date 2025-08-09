import type React from "react";
import { useEffect, useState } from "react";

// Inline icon components for the bottom navigation
const AskIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{/* Chat bubble */}
		<path d="M4 5H20V17H8L4 21V5Z" />
		{/* Three lines */}
		<path d="M7 9H17" />
		<path d="M7 12H15" />
	</svg>
);

const RoadmapIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{/* Folded map */}
		<path d="M9 4L15 6L21 4V18L15 20L9 18L3 20V6L9 4Z" />
		<path d="M9 4V18" />
		<path d="M15 6V20" />
	</svg>
);

const ChangelogIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{/* Newspaper */}
		<rect x="3" y="4" width="18" height="16" rx="2" />
		<path d="M7 8H16" />
		<path d="M7 12H17" />
		<path d="M7 16H13" />
	</svg>
);
import CreatePostForm from "./components/CreatePostForm";

interface OmniFeedbackWidgetProps {
	publicKey: string;
	boardId?: string;
	user?: {
		id?: string;
		name?: string;
		email?: string;
	};
	customData?: { [key: string]: string | undefined };
	apiUrl?: string;
	theme?: {
		primaryColor?: string;
		buttonText?: string;
	};
	position?: "center" | "above-button";
	onClose?: () => void;
	/** Base URL of your public portal to embed roadmap/changelog within the widget */
	portalUrl?: string;
}

const OmniFeedbackWidget: React.FC<OmniFeedbackWidgetProps> = ({
	publicKey,
	boardId,
	apiUrl = "https://localhost:8080",
	theme = {},
	position = "above-button",
	onClose,
	portalUrl,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isOpening, setIsOpening] = useState(false);
	const [isFabBouncing, setIsFabBouncing] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"submit" | "roadmap" | "changelog"
	>("submit");

	const closeWidget = () => {
		setIsOpen(false);
		onClose?.();
	};

	const startCloseAnimation = () => {
		setIsClosing(true);
		window.setTimeout(() => {
			setIsClosing(false);
			closeWidget();
		}, 200);
	};

	// Prevent background page scroll while the widget is open
	useEffect(() => {
		if (!isOpen) return;
		const prevBodyOverflow = document.body.style.overflow;
		const prevHtmlOverflow = document.documentElement.style.overflow;
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;
		const prevBodyPaddingRight = document.body.style.paddingRight;
		document.body.style.overflow = "hidden";
		document.documentElement.style.overflow = "hidden";
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}
		return () => {
			document.body.style.overflow = prevBodyOverflow;
			document.documentElement.style.overflow = prevHtmlOverflow;
			document.body.style.paddingRight = prevBodyPaddingRight;
		};
	}, [isOpen]);

	const animateClasses =
		position === "center"
			? isClosing
				? "zoom-out-95 fade-out animate-out duration-200 origin-center"
				: "zoom-in-95 fade-in animate-in duration-300 origin-center"
			: isClosing
				? "shrink-out-br fade-out animate-out duration-200 origin-bottom-right"
				: "grow-in-br fade-in animate-in duration-300 origin-bottom-right";

	const containerClass =
		position === "center"
			? "fixed inset-0 z-[1000001] p-0 md:flex md:items-center md:justify-center md:p-5"
			: "fixed inset-0 z-[1000001] p-0 md:inset-auto md:right-5 md:bottom-20 md:w-96 md:max-w-[calc(100vw-40px)]";

	const panelClass = (() => {
		const mdSizeClasses = position === "center" ? "md:w-full md:max-w-lg" : "";
		return `${animateClasses} relative h-full w-full overflow-hidden rounded-none bg-white shadow-2xl md:h-auto md:w-auto md:rounded-xl ${mdSizeClasses}`;
	})();

	const panelBodyHeightClass = "h-full md:h-[80vh] md:max-h-[700px]";

	// Compute FAB icon animation classes
	const chatIconAnimClass = (() => {
		if (isOpening) return "fab-icon-out";
		if (isOpen && isClosing) return "fab-icon-in";
		if (isOpen) return "opacity-0";
		return "opacity-100";
	})();

	const chevronIconAnimClass = (() => {
		if (isOpening) return "fab-icon-in";
		if (isOpen && isClosing) return "fab-icon-out";
		if (isOpen) return "opacity-100";
		return "opacity-0";
	})();

	const renderMainContent = () => {
		if (activeTab === "submit") {
			return (
				<>
					<div className="bg-gradient-to-b from-blue-800 via-60% via-blue-700 to-transparent pb-8 text-white">
						<div className="p-5">
							<div className="mb-8 flex items-center gap-3 ">
								<div className="h-8 w-8 rounded-full bg-white/20" />
							</div>
							<div className="space-y-1">
								<div className="font-semibold text-xl leading-6">
									Share your feedback
								</div>
								<div className="font-bold text-2xl leading-7">
									Tell us what’s working and what’s not
								</div>
								<div className="text-sm opacity-90">
									Your message goes straight to the team, we read every
									submission.
								</div>
							</div>
						</div>
					</div>
					<CreatePostForm
						publicKey={publicKey}
						apiUrl={apiUrl}
						defaultBoardId={boardId}
						onSuccess={startCloseAnimation}
					/>
				</>
			);
		}
		if (activeTab === "roadmap") {
			return (
				<div className="h-full w-full">
					{portalUrl ? (
						<iframe
							className="iframe-container"
							src={`${portalUrl.replace(/\/$/, "")}/roadmap`}
							title="Roadmap"
						/>
					) : (
						<div className="p-4 text-center text-gray-500">
							Connect portalUrl to show roadmap here.
						</div>
					)}
				</div>
			);
		}
		return (
			<div className="h-full w-full">
				{portalUrl ? (
					<iframe
						className="iframe-container"
						src={`${portalUrl.replace(/\/$/, "")}/changelog`}
						title="Changelog"
					/>
				) : (
					<div className="p-4 text-center text-gray-500">
						Connect portalUrl to show changelog here.
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="omni-feedback-widget fixed z-[999999] font-sans text-gray-800 text-sm leading-relaxed">
			{/* Floating Action Button */}
			<button
				type="button"
				className={`fixed right-5 bottom-5 z-[1000000] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl focus:outline-none active:scale-90 ${isFabBouncing ? "fab-bounce-slow" : ""}`}
				style={{ backgroundColor: theme.primaryColor || "#007bff" }}
				onClick={() => {
					// Re-trigger bounce
					setIsFabBouncing(false);
					// Force reflow to restart animation on next tick
					void document.body.offsetHeight;
					setIsFabBouncing(true);
					setTimeout(() => setIsFabBouncing(false), 450);

					if (isOpen) {
						startCloseAnimation();
					} else {
						setIsOpening(true);
						setActiveTab("submit");
						setIsOpen(true);
						window.setTimeout(() => setIsOpening(false), 340);
					}
				}}
				aria-label={isOpen ? "Close feedback widget" : "Open feedback widget"}
			>
				<span className="relative flex h-5 w-5 items-center justify-center text-white">
					{/* Chat icon (closed state) - message-square-plus */}
					<svg
						viewBox="0 0 24 24"
						width="20"
						height="20"
						aria-hidden="true"
						focusable="false"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className={`-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 ${chatIconAnimClass}`}
					>
						<path d="M21 14a4 4 0 0 1-4 4H9l-4 4v-4H5a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v7Z" />
						<path d="M12 8v5" />
						<path d="M9.5 10.5H14.5" />
					</svg>

					{/* Chevron icon (open state) */}
					<svg
						viewBox="0 0 24 24"
						width="20"
						height="20"
						aria-hidden="true"
						focusable="false"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className={`-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 ${chevronIconAnimClass}`}
					>
						<path d="M6 9L12 15L18 9" />
					</svg>
				</span>
			</button>

			{/* Widget Panel */}
			{isOpen && (
				<div className={containerClass}>
					<div className={panelClass}>
						{/* Mobile-only close button overlay */}
						<button
							type="button"
							className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-2xl text-gray-700 leading-none shadow-md backdrop-blur md:hidden"
							onClick={startCloseAnimation}
							aria-label="Close"
						>
							×
						</button>
						<div className={`flex flex-col ${panelBodyHeightClass}`}>
							<div className="flex-1 overflow-y-auto bg-white">
								<div className="p-0">{renderMainContent()}</div>
							</div>

							{/* Bottom nav tabs */}
							<div className="border-gray-200 border-t bg-white">
								<div className="grid grid-cols-3">
									{["submit", "roadmap", "changelog"].map((key) => {
										const isActive = activeTab === (key as typeof activeTab);
										const baseClasses = isActive
											? "text-blue-600"
											: "text-gray-500 hover:text-gray-700";
										return (
											<button
												type="button"
												key={key}
												className={`flex cursor-pointer flex-col items-center gap-1 py-3 text-xs transition-colors ${baseClasses}`}
												onClick={() => setActiveTab(key as typeof activeTab)}
												aria-selected={isActive}
												role="tab"
											>
												{key === "submit" && <AskIcon className="h-5 w-5" />}
												{key === "roadmap" && (
													<RoadmapIcon className="h-5 w-5" />
												)}
												{key === "changelog" && (
													<ChangelogIcon className="h-5 w-5" />
												)}
												<span className="mt-1">
													{key === "submit"
														? "Ask"
														: key.charAt(0).toUpperCase() + key.slice(1)}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OmniFeedbackWidget;
