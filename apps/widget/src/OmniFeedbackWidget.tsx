import type React from "react";
import { useEffect, useState } from "react";

// Inline icon components for the bottom navigation
const AskIcon: React.FC<{
	className?: string;
	style?: React.CSSProperties;
}> = ({ className, style }) => (
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
		className={className}
		style={style}
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

const RoadmapIcon: React.FC<{
	className?: string;
	style?: React.CSSProperties;
}> = ({ className, style }) => (
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
		className={className}
		style={style}
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

const ChangelogIcon: React.FC<{
	className?: string;
	style?: React.CSSProperties;
}> = ({ className, style }) => (
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
		className={className}
		style={style}
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
	onOpenChange?: (open: boolean) => void;
}

const OmniFeedbackWidget: React.FC<OmniFeedbackWidgetProps> = ({
	publicKey,
	boardId,
	apiUrl = "https://localhost:8080",
	theme = {},
	position = "above-button",
	onClose,
	portalUrl,
	onOpenChange,
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
		onOpenChange?.(false);
	};

	const startCloseAnimation = () => {
		setIsClosing(true);
		window.setTimeout(() => {
			setIsClosing(false);
			closeWidget();
		}, 200);
		onOpenChange?.(false);
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

	// Use window dimensions to decide breakpoint behavior (works correctly inside iframe)
	const [isDesktop, setIsDesktop] = useState(
		typeof window !== "undefined" && window.innerWidth >= 768,
	);

	useEffect(() => {
		const checkIsDesktop = () => {
			setIsDesktop(window.innerWidth >= 768);
		};

		checkIsDesktop();
		window.addEventListener("resize", checkIsDesktop);
		return () => window.removeEventListener("resize", checkIsDesktop);
	}, []);
	const containerStyle = (() => {
		if (position === "center") {
			return isDesktop
				? {
						position: "fixed" as const,
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						zIndex: 1000001,
						padding: "20px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}
				: {
						position: "fixed" as const,
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						zIndex: 1000001,
						padding: 0,
					};
		} else {
			return isDesktop
				? {
						position: "fixed" as const,
						top: "auto",
						right: "20px",
						bottom: "80px",
						left: "auto",
						zIndex: 1000001,
						padding: 0,
						width: "384px",
						maxWidth: "calc(100vw - 40px)",
					}
				: {
						position: "fixed" as const,
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						zIndex: 1000001,
						padding: 0,
					};
		}
	})();

	const panelStyle = (() => {
		const baseStyle = {
			position: "relative" as const,
			width: "100%",
			overflow: "hidden",
			backgroundColor: "white",
			boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
		};

		if (isDesktop) {
			return {
				...baseStyle,
				height: "auto",
				borderRadius: "12px",
				...(position === "center" ? { maxWidth: "512px" } : {}),
			};
		} else {
			return {
				...baseStyle,
				height: "100%",
				borderRadius: 0,
			};
		}
	})();

	const panelBodyHeightStyle = isDesktop
		? { height: "80vh", maxHeight: "700px" }
		: { height: "100%" };

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
					<div
						style={{
							background:
								"linear-gradient(to bottom, #1e40af 0%, #1d4ed8 60%, transparent 100%)",
							paddingBottom: "32px",
							color: "white",
						}}
					>
						<div style={{ padding: "20px" }}>
							<div
								style={{
									marginBottom: "32px",
									display: "flex",
									alignItems: "center",
									gap: "12px",
								}}
							>
								<div
									style={{
										height: "32px",
										width: "32px",
										borderRadius: "50%",
										backgroundColor: "rgba(255, 255, 255, 0.2)",
									}}
								/>
							</div>
							<div
								style={{ display: "flex", flexDirection: "column", gap: "4px" }}
							>
								<div
									style={{
										fontWeight: 600,
										fontSize: "20px",
										lineHeight: "24px",
									}}
								>
									Share your feedback
								</div>
								<div
									style={{
										fontWeight: 700,
										fontSize: "24px",
										lineHeight: "28px",
									}}
								>
									Tell us what’s working and what’s not
								</div>
								<div
									style={{
										fontSize: "14px",
										opacity: 0.9,
									}}
								>
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
				<div style={{ height: "100%", width: "100%" }}>
					{portalUrl ? (
						<iframe
							className="iframe-container"
							src={`${portalUrl.replace(/\/$/, "")}/roadmap`}
							title="Roadmap"
						/>
					) : (
						<div
							style={{
								padding: "16px",
								textAlign: "center",
								color: "#6b7280",
							}}
						>
							Connect portalUrl to show roadmap here.
						</div>
					)}
				</div>
			);
		}
		return (
			<div style={{ height: "100%", width: "100%" }}>
				{portalUrl ? (
					<iframe
						className="iframe-container"
						src={`${portalUrl.replace(/\/$/, "")}/changelog`}
						title="Changelog"
					/>
				) : (
					<div
						style={{
							padding: "16px",
							textAlign: "center",
							color: "#6b7280",
						}}
					>
						Connect portalUrl to show changelog here.
					</div>
				)}
			</div>
		);
	};

	return (
		<div
			className="omni-feedback-widget"
			style={{
				position: "fixed",
				zIndex: 999999,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
				color: "#374151",
				fontSize: "14px",
				lineHeight: "1.625",
			}}
		>
			{/* Floating Action Button */}
			<button
				type="button"
				className={isFabBouncing ? "fab-bounce-slow" : ""}
				style={{
					position: "fixed",
					right: "20px",
					bottom: "20px",
					zIndex: 1000000,
					display: "flex",
					height: "44px",
					width: "44px",
					cursor: "pointer",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: "50%",
					border: "none",
					boxShadow:
						"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
					transition: "transform 0.3s ease",
					backgroundColor: theme.primaryColor || "#007bff",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = "scale(1.05)";
					e.currentTarget.style.boxShadow =
						"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = "scale(1)";
					e.currentTarget.style.boxShadow =
						"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";
				}}
				onMouseDown={(e) => {
					e.currentTarget.style.transform = "scale(0.9)";
				}}
				onMouseUp={(e) => {
					e.currentTarget.style.transform = "scale(1.05)";
				}}
				onFocus={(e) => {
					e.currentTarget.style.outline = "none";
				}}
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
						onOpenChange?.(true);
					}
				}}
				aria-label={isOpen ? "Close feedback widget" : "Open feedback widget"}
			>
				<span
					style={{
						position: "relative",
						display: "flex",
						height: "20px",
						width: "20px",
						alignItems: "center",
						justifyContent: "center",
						color: "white",
					}}
				>
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
						className={chatIconAnimClass}
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
						}}
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
						className={chevronIconAnimClass}
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
						}}
					>
						<path d="M6 9L12 15L18 9" />
					</svg>
				</span>
			</button>

			{/* Widget Panel */}
			{isOpen && (
				<div style={containerStyle}>
					<div className={animateClasses} style={panelStyle}>
						{/* Mobile-only close button overlay */}
						<button
							type="button"
							style={{
								position: "absolute",
								top: "12px",
								right: "12px",
								zIndex: 20,
								display: isDesktop ? "none" : "flex",
								height: "36px",
								width: "36px",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: "50%",
								backgroundColor: "rgba(255, 255, 255, 0.8)",
								color: "#374151",
								fontSize: "24px",
								lineHeight: 1,
								boxShadow:
									"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
								backdropFilter: "blur(8px)",
								border: "none",
								cursor: "pointer",
							}}
							onClick={startCloseAnimation}
							aria-label="Close"
						>
							×
						</button>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								...panelBodyHeightStyle,
							}}
						>
							<div
								style={{
									flex: 1,
									overflowY: "auto",
									backgroundColor: "white",
								}}
							>
								<div style={{ padding: 0 }}>{renderMainContent()}</div>
							</div>

							{/* Bottom nav tabs */}
							<div
								style={{
									borderTop: "1px solid #e5e7eb",
									backgroundColor: "white",
								}}
							>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
									}}
								>
									{["submit", "roadmap", "changelog"].map((key) => {
										const isActive = activeTab === (key as typeof activeTab);
										const baseStyle = {
											display: "flex",
											cursor: "pointer",
											flexDirection: "column" as const,
											alignItems: "center",
											gap: "4px",
											paddingTop: "12px",
											paddingBottom: "12px",
											fontSize: "12px",
											transition: "color 0.15s ease",
											color: isActive ? "#2563eb" : "#6b7280",
											border: "none",
											backgroundColor: "transparent",
										};
										return (
											<button
												type="button"
												key={key}
												style={baseStyle}
												onMouseEnter={(e) => {
													if (!isActive) {
														e.currentTarget.style.color = "#374151";
													}
												}}
												onMouseLeave={(e) => {
													if (!isActive) {
														e.currentTarget.style.color = "#6b7280";
													}
												}}
												onClick={() => setActiveTab(key as typeof activeTab)}
												aria-selected={isActive}
												role="tab"
											>
												{key === "submit" && (
													<AskIcon style={{ height: "20px", width: "20px" }} />
												)}
												{key === "roadmap" && (
													<RoadmapIcon
														style={{ height: "20px", width: "20px" }}
													/>
												)}
												{key === "changelog" && (
													<ChangelogIcon
														style={{ height: "20px", width: "20px" }}
													/>
												)}
												<span style={{ marginTop: "4px" }}>
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
