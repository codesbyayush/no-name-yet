import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Function to apply theme based on Tailwind v4 approach
function applyTheme(theme: Theme) {
	const root = document.documentElement;
	
	// Remove existing theme classes
	root.classList.remove("light", "dark");
	
	if (theme === "system") {
		// Remove theme from localStorage to respect system preference
		localStorage.removeItem("vite-ui-theme");
		// Apply dark class if system prefers dark
		root.classList.toggle(
			"dark",
			window.matchMedia("(prefers-color-scheme: dark)").matches
		);
	} else {
		// Set explicit theme
		localStorage.setItem("vite-ui-theme", theme);
		root.classList.add(theme);
	}
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		// Check localStorage first, then fall back to default
		const stored = localStorage.getItem(storageKey);
		if (stored === "dark" || stored === "light") {
			return stored;
		}
		return defaultTheme;
	});

	useEffect(() => {
		// Apply theme on mount
		applyTheme(theme);
		
		// Listen for system theme changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (theme === "system") {
				applyTheme("system");
			}
		};
		
		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const value = {
		theme,
		setTheme: (newTheme: Theme) => {
			setTheme(newTheme);
			applyTheme(newTheme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
