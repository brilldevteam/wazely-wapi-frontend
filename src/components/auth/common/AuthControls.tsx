"use client";

import { Button } from "@/src/elements/ui/button";
import LanguageDropdown from "@/src/components/layouts/LanguageDropdown";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";

const subscribeToMount = () => () => {};

export const AuthControls = ({ showLanguage = false }: { showLanguage?: boolean }) => {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);

  if (!mounted) {
    return null;
  }

  const darkMode = resolvedTheme === "dark";

  const handleThemeToggle = () => {
    if (!themeBtnRef.current) return;

    const rect = themeBtnRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    if (!document.startViewTransition) {
      setTheme(darkMode ? "light" : "dark");
      return;
    }

    const transition = document.startViewTransition(() => {
      setTheme(darkMode ? "light" : "dark");
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <div className="absolute top-4 end-4 z-50 flex items-center bg-white/60 dark:bg-(--table-hover)! rounded-lg border border-slate-200/50 dark:border-(--card-border-color) shadow-xs transition-all duration-300">
      {showLanguage && <LanguageDropdown showLabel />}
      <Button
        ref={themeBtnRef}
        variant="ghost"
        size="icon"
        onClick={handleThemeToggle}
        className="w-9 h-9 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:text-primary dark:hover:bg-(--table-hover)"
        aria-label={darkMode ? t("login_light_theme", "Switch to light mode") : t("login_dark_theme", "Switch to dark mode")}
      >
        {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
      </Button>
    </div>
  );
};
