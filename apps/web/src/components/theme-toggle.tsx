import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 items-center justify-between">
      <div className="pr-2 text-sm font-medium flex items-center gap-2">
        {
            theme === "light" ? <Sun className="size-4" /> : theme === "dark" ? <Moon className="size-4" /> : <Monitor className="size-4" />
        }
        <span>Theme</span>
      </div>
      <div className="flex items-center gap-1 px-2">
        <button
          onClick={() => setTheme("light")}
          className={`flex items-center justify-center rounded-md p-2 transition-all ${
            theme === "light"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
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
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
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
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
          }`}
          title="System theme"
        >
          <Monitor className="size-4" />
        </button>
      </div>
    </div>
  );
} 