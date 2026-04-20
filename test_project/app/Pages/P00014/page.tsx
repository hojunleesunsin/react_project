"use client";

import { memo, useCallback, useDeferredValue, useMemo, useState, useTransition } from "react";

type Product = {
  id: number;
  name: string;
  team: "Frontend" | "Backend" | "Data";
  score: number;
};

type SortMode = "name" | "score";

const PRODUCTS: Product[] = Array.from({ length: 5000 }).map((_, idx) => ({
  id: idx + 1,
  name: `Product-${idx + 1}`,
  team: idx % 3 === 0 ? "Frontend" : idx % 3 === 1 ? "Backend" : "Data",
  score: (idx * 17) % 1000,
}));

const ResultList = memo(function ResultList({
  rows,
  selectedId,
  onSelect,
}: {
  rows: Product[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <ul className="grid max-h-[380px] gap-1 overflow-auto rounded-lg border border-slate-200 bg-white p-2">
      {rows.slice(0, 120).map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={() => onSelect(row.id)}
            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
              selectedId === row.id ? "bg-blue-600 text-white" : "hover:bg-slate-100"
            }`}
          >
            <span>{row.name}</span>
            <span className="text-xs opacity-80">
              {row.team} / {row.score}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
});

export default function Page() {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<"all" | Product["team"]>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const deferredQuery = useDeferredValue(query);
  const isTypingLagging = query !== deferredQuery;

  const filteredRows = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    const next = PRODUCTS.filter((row) => {
      const teamMatch = team === "all" || row.team === team;
      const nameMatch = !normalized || row.name.toLowerCase().includes(normalized);

      // 무거운 계산이 있다고 가정한 더미 연산
      let checksum = 0;
      for (let i = 0; i < 50; i += 1) checksum += (row.score * i) % 13;

      return teamMatch && nameMatch && checksum >= 0;
    });

    if (sortMode === "name") {
      next.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      next.sort((a, b) => b.score - a.score);
    }

    return next;
  }, [deferredQuery, team, sortMode]);

  const selectedRow = useMemo(
    () => filteredRows.find((row) => row.id === selectedId) ?? null,
    [filteredRows, selectedId]
  );

  const onSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  const onChangeSort = useCallback(
    (nextSort: SortMode) => {
      startTransition(() => {
        setSortMode(nextSort);
      });
    },
    [startTransition]
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">P00014 - 렌더 최적화 훅 조합 예제</h1>
          <p className="mt-1 text-sm text-slate-600">
            `useDeferredValue`로 입력 반응성을 유지하고, `useTransition`으로 정렬 변경 우선순위를 낮춘 예제입니다.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="grid gap-1 text-sm font-semibold">
              검색어
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: Product-12"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold">
              팀
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as "all" | Product["team"])}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              >
                <option value="all">전체</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Data">Data</option>
              </select>
            </label>

            <div className="grid gap-2 text-sm font-semibold">
              <p>정렬</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChangeSort("name")}
                  className={`rounded-md px-3 py-2 text-xs ${
                    sortMode === "name" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  이름순
                </button>
                <button
                  type="button"
                  onClick={() => onChangeSort("score")}
                  className={`rounded-md px-3 py-2 text-xs ${
                    sortMode === "score" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  점수순
                </button>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <p>입력값: {query || "-"}</p>
              <p>지연 반영값: {deferredQuery || "-"}</p>
              <p>입력 지연 상태: {isTypingLagging ? "지연 반영 중" : "최신 반영"}</p>
              <p>전환 상태: {isPending ? "정렬 전환 중" : "대기"}</p>
              <p>결과 건수: {filteredRows.length.toLocaleString()}건</p>
            </div>
          </aside>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">결과 목록 (상위 120건)</h2>
            <ResultList rows={filteredRows} selectedId={selectedId} onSelect={onSelect} />

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-semibold">선택한 항목</p>
              {selectedRow ? (
                <p className="mt-1">
                  {selectedRow.name} / {selectedRow.team} / {selectedRow.score}
                </p>
              ) : (
                <p className="mt-1 text-slate-500">아직 선택한 항목이 없습니다.</p>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
