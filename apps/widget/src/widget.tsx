import { createRoot } from "react-dom/client";
import OmniFeedbackWidget from "./OmniFeedbackWidget";
import "./index.css";

// Global interface for the widget
interface OmniFeedbackWidgetOptions {
	publicKey: string;
	boardId?: string;
	user?: {
		id?: string;
		name?: string;
		email?: string;
	};
	customData?: { [key: string]: string | undefined };
	jwtAuthToken?: string;
	apiUrl?: string;
	theme?: {
		primaryColor?: string;
		buttonText?: string;
	};
	targetElement?: string | HTMLElement;
	position?: "center" | "above-button";
}

interface OmniFeedbackWidgetInstance {
	destroy: () => void;
	show: () => void;
	hide: () => void;
	isVisible: () => boolean;
	getElement: () => HTMLElement;
}

class OmniFeedbackWidgetManager {
	private instances: Map<string, { root: any; container: HTMLElement }> =
		new Map();

	init(options: OmniFeedbackWidgetOptions): OmniFeedbackWidgetInstance {
		const {
			targetElement = "body",
			position = "above-button",
			...widgetProps
		} = options;

		// Get target container
		let container: HTMLElement;
		if (typeof targetElement === "string") {
			container = document.querySelector(targetElement) as HTMLElement;
			if (!container) {
				throw new Error(`Target element "${targetElement}" not found`);
			}
		} else {
			container = targetElement;
		}

		// Create a unique container for this widget instance
		const widgetContainer = document.createElement("div");
		widgetContainer.className = "omnifeedback-widget-container";
		widgetContainer.style.position = "relative";
		widgetContainer.style.zIndex = "999999";

		// Generate unique ID for this instance
		const instanceId = `omnifeedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		widgetContainer.id = instanceId;

		container.appendChild(widgetContainer);

		// Create React root and render widget
		const root = createRoot(widgetContainer);

		const renderWidget = (visible = true) => {
			root.render(
				<div style={{ display: visible ? "block" : "none" }}>
					<OmniFeedbackWidget
						{...widgetProps}
						position={position}
						onClose={() => {
							// Widget handles its own visibility, but we can add hooks here
						}}
					/>
				</div>,
			);
		};

		renderWidget();

		// Store instance for cleanup
		this.instances.set(instanceId, { root, container: widgetContainer });

		// Return instance control object
		return {
			destroy: () => {
				const instance = this.instances.get(instanceId);
				if (instance) {
					instance.root.unmount();
					instance.container.remove();
					this.instances.delete(instanceId);
				}
			},
			show: () => renderWidget(true),
			hide: () => renderWidget(false),
			isVisible: () => true,
			getElement: () => widgetContainer,
		};
	}

	// Cleanup all instances
	destroyAll() {
		this.instances.forEach((instance) => {
			instance.root.unmount();
			instance.container.remove();
		});
		this.instances.clear();
	}
}

// Create global instance
const widgetManager = new OmniFeedbackWidgetManager();

// Global API that will be exposed
const OmniFeedbackWidgetAPI = {
	init: (options: OmniFeedbackWidgetOptions) => widgetManager.init(options),
	destroyAll: () => widgetManager.destroyAll(),
	version: "1.0.0",
};

// For UMD export - ensure it's available globally
if (typeof window !== "undefined") {
	(window as any).OmniFeedbackWidget = OmniFeedbackWidgetAPI;
}

// For UMD export
export default OmniFeedbackWidgetAPI;

// Auto-initialize if data attributes are found on script tag
if (typeof document !== "undefined" && typeof window !== "undefined") {
	const initializeFromDataAttributes = () => {
		// Look for a script tag with the required data-public-key attribute.
		// This will find the first script tag that matches, which is typical for widgets.
		const scriptTag = document.querySelector("script[data-public-key]");

		if (scriptTag instanceof HTMLScriptElement) {
			const {
				publicKey,
				boardId,
				apiUrl,
				target,
				position,
				primaryColor,
				buttonText,
				userId,
				userName,
				userEmail,
				jwtAuthToken,
				...customData // Capture all other data-* attributes as customData
			} = scriptTag.dataset;

			if (publicKey) {
				try {
					widgetManager.init({
						publicKey,
						boardId,
						apiUrl,
						targetElement: target,
						position:
							position === "center" || position === "above-button"
								? position
								: undefined,
						theme: {
							primaryColor,
							buttonText,
						},
						user: {
							id: userId,
							name: userName,
							email: userEmail,
						},
						customData,
						jwtAuthToken,
					});
				} catch (error) {}
			}
		}
	};

	// Try to initialize immediately if DOM is already ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initializeFromDataAttributes);
	} else {
		initializeFromDataAttributes();
	}
}
