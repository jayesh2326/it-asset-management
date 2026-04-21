import { Monitor, MoonStar, SunMedium } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../hooks/use-theme";
import { cn } from "../../lib/utils";

export function ThemeToggle({
  compact = false,
  className
}: {
  compact?: boolean;
  className?: string;
}) {
  const { theme, isSystemPreference, toggleTheme, setTheme } = useTheme();
  const activeClass =
    "bg-[var(--surface-secondary)] text-[var(--text-primary)] ring-[var(--border-strong)] shadow-[var(--shadow-soft)]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!compact ? (
        <Button
          type="button"
          variant="ghost"
          className={cn("px-3", isSystemPreference && activeClass)}
          onClick={() => setTheme(null)}
          title="Use system theme"
        >
          <Monitor className="mr-2 h-4 w-4" />
          {isSystemPreference ? "System" : "Auto"}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        className={cn("px-3", !isSystemPreference && activeClass)}
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <>
            <SunMedium className={cn("h-4 w-4", !compact && "mr-2")} />
            {!compact ? "Light mode" : null}
          </>
        ) : (
          <>
            <MoonStar className={cn("h-4 w-4", !compact && "mr-2")} />
            {!compact ? "Dark mode" : null}
          </>
        )}
      </Button>
    </div>
  );
}
