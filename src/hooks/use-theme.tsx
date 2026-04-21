import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  preference: ThemeMode | null;
  isSystemPreference: boolean;
  setTheme: (theme: ThemeMode | null) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "it-asset-manager-theme";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function canUseMatchMedia() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function getSystemTheme(): ThemeMode {
  if (canUseMatchMedia() && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemeMode | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  });
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(() => getSystemTheme());

  const theme = preference ?? systemTheme;

  useEffect(() => {
    if (!canUseMatchMedia()) {
      setSystemTheme("light");
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    setSystemTheme(media.matches ? "dark" : "light");

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  useEffect(() => {
    applyTheme(theme);

    const root = document.documentElement;
    const animationFrame = window.requestAnimationFrame(() => {
      root.classList.add("theme-ready");
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference,
      isSystemPreference: preference === null,
      setTheme: (nextTheme) => {
        setPreference(nextTheme);

        if (nextTheme) {
          window.localStorage.setItem(STORAGE_KEY, nextTheme);
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      },
      toggleTheme: () => {
        const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
        setPreference(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      }
    }),
    [preference, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
