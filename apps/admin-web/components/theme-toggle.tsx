"use client";

import { useSyncExternalStore } from "react";
import { Button } from "./ui";

const KEY = "cis-admin-theme";
type Theme = "dark" | "light";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeToTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => "light");

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(KEY, next);
  }

  const nextMode = theme === "dark" ? "light" : "dark";
  return <Button aria-label={`Switch to ${nextMode} mode`} aria-pressed={theme === "light"} className="theme-toggle" onClick={toggle} title={`Switch to ${nextMode} mode`} variant="icon">
    <svg aria-hidden="true" className="theme-toggle__sun" fill="none" height="17" viewBox="0 0 24 24" width="17"><path d="M12 3v2m0 14v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" /></svg>
    <svg aria-hidden="true" className="theme-toggle__moon" fill="none" height="17" viewBox="0 0 24 24" width="17"><path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5A8.5 8.5 0 1 0 20.5 15.2Z" fill="currentColor" /></svg>
  </Button>;
}
