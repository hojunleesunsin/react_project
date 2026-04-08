"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { saveTickSnapshotAction } from "./actions";

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const saveSnapshot = async (source: "interval" | "manual", nextTheme: "light" | "dark", nextCount: number) => {
    setIsSaving(true);
    const result = await saveTickSnapshotAction({ theme: nextTheme, count: nextCount });
    const line = `[${result.at}] (${source}) theme=${result.theme}, count=${result.count}`;
    setLogs((prev) => [line, ...prev].slice(0, 10));
    setIsSaving(false);
  };

  // useEffectEvent 핵심:
  // effect(구독)는 한 번만 유지하고, 콜백에서 최신 state(theme/count)를 읽는다.
  const onTick = useEffectEvent(async () => {
    await saveSnapshot("interval", theme, count);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      void onTick();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className={`min-h-screen p-6 ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="m-0 text-2xl font-semibold">P00006 - useEffectEvent + 클라이언트 서버 액션 호출</h1>
        <p className="mt-2 text-slate-600">
          interval 구독은 한 번만 유지하고, 콜백(useEffectEvent)에서 최신 상태를 읽어 서버 액션을 호출합니다.
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
          <button
            type="button"
            onClick={() => void saveSnapshot("manual", theme, count)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-white"
          >
            수동 저장
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          저장 상태: {isSaving ? "서버 액션 호출 중..." : "대기"} / 현재 theme={theme}, count={count}
        </p>
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

