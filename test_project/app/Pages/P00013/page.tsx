"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type Filters = {
  region: string;
  status: string;
  keyword: string;
};

type Item = {
  id: number;
  name: string;
  region: string;
  status: string;
};

type Mode = "debounce" | "deferred";

const formatFilters = (value: Filters) =>
  `{ region: "${value.region}", status: "${value.status}", keyword: "${value.keyword}" }`;

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const SOURCE_ITEMS: Item[] = Array.from({ length: 3000 }).map((_, i) => ({
  id: i + 1,
  name: `Item-${i + 1}`,
  region: i % 2 === 0 ? "SEOUL" : "BUSAN",
  status: i % 3 === 0 ? "ACTIVE" : "INACTIVE",
}));

export default function P00013Page() {
  const [mode, setMode] = useState<Mode>("deferred");
  const [filters, setFilters] = useState<Filters>({ region: "", status: "", keyword: "" });
  const [logs, setLogs] = useState<string[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const logSeqRef = useRef(0);
  const lastEventTimeRef = useRef<number | null>(null);

  const debouncedFilters = useDebouncedValue(filters, 400);
  const deferredFilters = useDeferredValue(filters);
  const activeFilters = mode === "debounce" ? debouncedFilters : deferredFilters;

  const isStale = JSON.stringify(filters) !== JSON.stringify(activeFilters);

  const appendLog = useCallback((label: string, value: Filters) => {
    if (startTimeRef.current === null) startTimeRef.current = performance.now();
    const now = performance.now();
    const deltaMs = lastEventTimeRef.current === null ? 0 : now - lastEventTimeRef.current;
    lastEventTimeRef.current = now;
    logSeqRef.current += 1;

    const elapsedMs = (now - startTimeRef.current).toFixed(1);
    const line = `#${logSeqRef.current} +${elapsedMs}ms (Δ${deltaMs.toFixed(1)}ms) ${label} ${formatFilters(value)}`;

    console.log(line);
    setLogs((prev) => [...prev, line]);
  }, []);

  useEffect(() => appendLog("[filters 변경]", filters), [appendLog, filters]);
  useEffect(() => appendLog("[debouncedFilters 변경]", debouncedFilters), [appendLog, debouncedFilters]);
  useEffect(() => appendLog("[deferredFilters 변경]", deferredFilters), [appendLog, deferredFilters]);
  useEffect(() => appendLog("[activeFilters 변경]", activeFilters), [appendLog, activeFilters]);

  const visibleItems = useMemo(() => {
    const { region, status, keyword } = activeFilters;
    const normalizedKeyword = keyword.trim().toLowerCase();

    return SOURCE_ITEMS.filter((item) => {
      const regionMatch = !region || item.region === region;
      const statusMatch = !status || item.status === status;
      const keywordMatch = !normalizedKeyword || item.name.toLowerCase().includes(normalizedKeyword);
      return regionMatch && statusMatch && keywordMatch;
    });
  }, [activeFilters]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="m-0 text-2xl font-bold">P00013 - debounce vs useDeferredValue</h2>
      <p className="mb-5 mt-2 text-sm text-slate-600">
        모드를 선택하면 같은 입력에서 debounce/deferred 동작 차이를 바로 비교할 수 있습니다.
      </p>

      <section className="mt-0 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === "deferred"}
              onChange={() => setMode("deferred")}
            />
            useDeferredValue
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === "debounce"}
              onChange={() => setMode("debounce")}
            />
            debounce(400ms)
          </label>
        </div>

        <label className="grid gap-1 text-sm font-semibold">
          지역
          <select
            value={filters.region}
            onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">전체</option>
            <option value="SEOUL">SEOUL</option>
            <option value="BUSAN">BUSAN</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm font-semibold">
          상태
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">전체</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm font-semibold">
          키워드
          <input
            value={filters.keyword}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
            placeholder="예: Item-12"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
          />
        </label>

        <p className="m-0 text-sm text-slate-600">
          모드: <strong>{mode}</strong> / 반영 상태: {isStale ? "지연 반영 중" : "최신 반영 완료"} / 결과:{" "}
          {visibleItems.length.toLocaleString()}건
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="m-0 mb-2 text-sm text-slate-600">상위 120건 표시</p>
        <ul className="grid max-h-72 gap-1 overflow-auto text-sm">
          {visibleItems.slice(0, 120).map((item) => (
            <li key={item.id} className="rounded border border-slate-100 px-2 py-1">
              {item.name} / {item.region} / {item.status}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="m-0 mb-2 text-sm font-semibold text-slate-700">디버그 로그(전체 누적)</p>
        <p className="m-0 mb-2 text-xs text-slate-500">
          콘솔에서도 동일한 로그가 보입니다. 키워드를 빠르게 입력해서 값 반영 순서를 비교해보세요.
        </p>
        <ul className="grid max-h-44 gap-1 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
          {logs.map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
