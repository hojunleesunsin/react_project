"use client";

import { useEffect, useState } from "react";

export function ClientUiShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [font, setFont] = useState<"sm" | "md" | "lg">("md");
  const fontClass = font === "sm" ? "text-sm" : font === "lg" ? "text-lg" : "text-base";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    return () => root.classList.remove("dark");
  }, [theme]);

  return (
    <div className={`min-h-screen ${fontClass} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-2 px-6 pt-4">
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          className="rounded-md bg-slate-200 px-3 py-1.5 text-sm text-slate-800 dark:bg-slate-700 dark:text-slate-100"
        >
          {theme === "dark" ? "라이트 모드" : "다크 모드"}
        </button>
        <button
          type="button"
          onClick={() => setFont("sm")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            font === "sm"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
          }`}
        >
          작게
        </button>
        <button
          type="button"
          onClick={() => setFont("md")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            font === "md"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
          }`}
        >
          보통
        </button>
        <button
          type="button"
          onClick={() => setFont("lg")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            font === "lg"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
          }`}
        >
          크게
        </button>
      </div>
      {children}
    </div>
  );
}

