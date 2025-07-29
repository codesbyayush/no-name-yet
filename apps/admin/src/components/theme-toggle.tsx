import { useTheme } from "@/components/theme-provider";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 pr-2 font-medium text-sm">
        {theme === "light" ? (
          <Sun className="size-4" />
        ) : theme === "dark" ? (
          <Moon className="size-4" />
        ) : (
          <Monitor className="size-4" />
        )}
        <span>Theme</span>
      </div>
      <div className="flex items-center gap-1 px-2">
        <button
          onClick={() => setTheme("light")}
          className={`flex items-center justify-center rounded-md p-2 transition-all ${
            theme === "light"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="Light theme"
        >
          <Sun className="size-4" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-center rounded-md p-2 transition-all ${
            theme === "dark"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="Dark theme"
        >
          <Moon className="size-4" />
        </button>
        <button
          onClick={() => setTheme("system")}
          className={`flex items-center justify-center rounded-md p-2 transition-all ${
            theme === "system"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="System theme"
        >
          <Monitor className="size-4" />
        </button>
      </div>
    </div>
  );
}
