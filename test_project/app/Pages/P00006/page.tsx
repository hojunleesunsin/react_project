"use client";

import { useEffect, useEffectEvent, useState } from "react";

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // useEffectEvent:
  // interval을 다시 등록하지 않고도 최신 theme/count를 읽기 위해 사용
  const onTick = useEffectEvent(() => {
    const line = `[${new Date().toLocaleTimeString()}] theme=${theme}, count=${count}`;
    setLogs((prev) => [line, ...prev].slice(0, 8));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      onTick();
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className={`min-h-screen p-6 ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="m-0 text-2xl font-semibold">P00006 - useEffectEvent 예시</h1>
        <p className="mt-2 text-slate-600">
          interval 구독은 한 번만 유지하고, 콜백에서 최신 상태를 읽는 예시입니다.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="rounded-md bg-slate-200 px-3 py-1.5"
          >
            테마 토글
          </button>
          <button type="button" onClick={() => setCount((v) => v + 1)} className="rounded-md bg-blue-600 px-3 py-1.5 text-white">
            count +1
          </button>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5">
          {logs.map((log, idx) => (
            <li key={`${log}-${idx}`} className="text-sm">
              {log}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

