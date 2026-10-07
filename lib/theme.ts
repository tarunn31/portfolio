/** Shared by the nav toggle and the command palette. The inline script in <head> sets the first value. */
export function toggleTheme(): "light" | "dark" {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage can be blocked; the toggle still works for this visit.
  }
  return next;
}
