"use client";

import { useTheme } from "next-themes";
import DarkMode from "@mui/icons-material/DarkModeOutlined";
import LightMode from "@mui/icons-material/LightModeOutlined";

// Both icons are rendered and swapped with CSS, so the server and client markup match
// even though the theme is only known in the browser.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-9 place-items-center rounded-md text-xl text-muted hover:bg-hover hover:text-fg"
    >
      <LightMode fontSize="inherit" className="hidden dark:block" />
      <DarkMode fontSize="inherit" className="dark:hidden" />
    </button>
  );
}
