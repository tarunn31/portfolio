"use client";

import { useEffect, useState } from "react";
import { toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  // Follows data-theme however it changes (this button, the command palette, or the first-paint script).
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const label =
    dark === null ? "Toggle theme" : dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label={label}
      className="ml-1 inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-text"
    >
      {/* Sun shows in dark mode (switch to light), moon in light mode. CSS picks one. */}
      <svg
        className="icon-for-dark"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <svg
        className="icon-for-light"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  );
}
