import { useEffect, useRef } from "react";

interface OmniFeedbackWidgetProps {
	tenantId: string;
	apiUrl?: string;
	jwtAuthToken?: string;
	theme?: {
		primaryColor?: string;
		buttonText?: string;
	};
	targetElement?: string;
	onFeedbackSubmitted?: (feedback: any) => void;
	onError?: (error: string) => void;
}

declare global {
	interface Window {
		OmniFeedbackWidget: {
			init: (options: any) => any;
			destroyAll: () => void;
			version: string;
		};
	}
}

export function OmniFeedbackWidget({
	tenantId,
	apiUrl = "http://localhost:8080",
	jwtAuthToken,
	theme = { primaryColor: "#3b82f6" },
	targetElement,
	onFeedbackSubmitted,
	onError,
}: OmniFeedbackWidgetProps) {
	const widgetInstanceRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const initializeWidget = () => {
			try {
				if (typeof window.OmniFeedbackWidget === "undefined") {
					console.warn(
						"OmniFeedbackWidget not loaded yet. Make sure the script is included.",
					);
					return;
				}

				// Destroy existing instance if any
				if (widgetInstanceRef.current) {
					widgetInstanceRef.current.destroy();
				}

				// Initialize new widget instance
				const options = {
					tenantId,
					apiUrl,
					jwtAuthToken,
					theme,
					targetElement:
						targetElement ||
						(containerRef.current ? containerRef.current : "body"),
				};

				widgetInstanceRef.current = window.OmniFeedbackWidget.init(options);

				// Add event listeners for feedback events
				if (onFeedbackSubmitted) {
					// Custom event listener for feedback submission
					const handleFeedbackSubmitted = (event: CustomEvent) => {
						onFeedbackSubmitted(event.detail);
					};

					window.addEventListener(
						"omnifeedback:submitted" as any,
						handleFeedbackSubmitted,
					);

					// Cleanup function will remove this listener
					return () => {
						window.removeEventListener(
							"omnifeedback:submitted" as any,
							handleFeedbackSubmitted,
						);
					};
				}
			} catch (error) {
				console.error("Failed to initialize OmniFeedback widget:", error);
				onError?.(
					error instanceof Error
						? error.message
						: "Failed to initialize widget",
				);
			}
		};

		// Try to initialize immediately
		if (typeof window.OmniFeedbackWidget !== "undefined") {
			initializeWidget();
		} else {
			// Wait for the widget script to load
			const checkForWidget = setInterval(() => {
				if (typeof window.OmniFeedbackWidget !== "undefined") {
					clearInterval(checkForWidget);
					initializeWidget();
				}
			}, 100);

			// Cleanup interval after 10 seconds
			setTimeout(() => {
				clearInterval(checkForWidget);
				if (typeof window.OmniFeedbackWidget === "undefined") {
					onError?.("Widget script failed to load within 10 seconds");
				}
			}, 10000);

			return () => clearInterval(checkForWidget);
		}

		return () => {
			// Cleanup widget instance
			if (widgetInstanceRef.current) {
				widgetInstanceRef.current.destroy();
				widgetInstanceRef.current = null;
			}
		};
	}, [
		tenantId,
		apiUrl,
		jwtAuthToken,
		theme,
		targetElement,
		onFeedbackSubmitted,
		onError,
	]);

	// Expose widget control methods
	const showWidget = () => {
		widgetInstanceRef.current?.show();
	};

	const hideWidget = () => {
		widgetInstanceRef.current?.hide();
	};

	// If targetElement is provided, don't render a container
	if (targetElement) {
		return null;
	}

	// Render a container for the widget if no targetElement is specified
	return (
		<div
			ref={containerRef}
			className="omnifeedback-container"
			style={{ position: "relative", minHeight: "60px" }}
		/>
	);
}

// Hook for programmatic widget control
export function useOmniFeedbackWidget() {
	const showWidget = () => {
		if (typeof window.OmniFeedbackWidget !== "undefined") {
			// Since the widget manages its own visibility, we can trigger it to show
			const event = new CustomEvent("omnifeedback:show");
			window.dispatchEvent(event);
		}
	};

	const hideWidget = () => {
		if (typeof window.OmniFeedbackWidget !== "undefined") {
			const event = new CustomEvent("omnifeedback:hide");
			window.dispatchEvent(event);
		}
	};

	const getWidgetStatus = () => {
		return {
			isLoaded: typeof window.OmniFeedbackWidget !== "undefined",
			version: window.OmniFeedbackWidget?.version || "Unknown",
		};
	};

	return {
		showWidget,
		hideWidget,
		getWidgetStatus,
	};
}

export default OmniFeedbackWidget;
