"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { loadSearchRowsAction, type SearchRow } from "./actions";

export default function SearchList() {
  const [serverKeyword, setServerKeyword] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [useDeferred, setUseDeferred] = useState(true);
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [message, setMessage] = useState("조회 버튼을 누르면 서버 액션으로 데이터를 불러옵니다.");
  const [isPending, startTransition] = useTransition();

  // useDeferredValue: 입력값은 즉시 반영하고, 무거운 필터 계산은 한 템포 늦춰 처리한다.
  const deferredFilter = useDeferredValue(clientFilter);
  const activeFilter = useDeferred ? deferredFilter : clientFilter;
  const isStale = clientFilter !== activeFilter;

  const filteredRows = useMemo(() => {
    const normalized = activeFilter.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => row.label.toLowerCase().includes(normalized));
  }, [rows, activeFilter]);

  const onSearch = () => {
    startTransition(async () => {
      setMessage("서버 액션 호출 중...");
      const start = Date.now();
      const data = await loadSearchRowsAction(serverKeyword);
      setRows(data);
      setMessage(`서버 액션 완료: ${data.length.toLocaleString()}건 (${Date.now() - start}ms)`);
    });
  };

  return (
    <main className="mx-auto mt-10 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="m-0 text-2xl font-bold">P00003 - useDeferredValue + 서버 액션 직접 호출</h1>
      <p className="mb-5 mt-2 text-sm text-slate-600">
        서버 조회는 버튼으로 수행하고, 조회 후 클라이언트 필터링은 useDeferredValue로 부드럽게 처리합니다.
      </p>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="grid gap-1 text-sm font-semibold">
          서버 검색어(서버 액션 파라미터)
          <input
            value={serverKeyword}
            onChange={(e) => setServerKeyword(e.target.value)}
            placeholder="예: item 12"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
          />
        </label>
        <button
          type="button"
          onClick={onSearch}
          disabled={isPending}
          className={`w-fit rounded-md px-4 py-2 font-semibold text-white ${
            isPending ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPending ? "조회 중..." : "조회(onSearch)"}
        </button>
      </section>

      <section className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={useDeferred}
            onChange={(e) => setUseDeferred(e.target.checked)}
          />
          useDeferredValue 사용
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          클라이언트 필터(useDeferredValue 대상)
          <input
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            placeholder="조회된 목록 내에서 추가 필터"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
          />
        </label>
        <p className="m-0 text-sm text-slate-600">
          상태: {message} / 모드: {useDeferred ? "Deferred ON" : "Deferred OFF"} / 필터 계산 상태:{" "}
          {isStale ? "계산 중(지연 반영)" : "최신 반영 완료"}
        </p>
        <p className="m-0 text-xs text-slate-500">
          체감 팁: 조회 후 필터 입력창에 빠르게 타이핑해보세요. OFF는 입력이 더 끊기고, ON은 입력 반응이 더 부드럽습니다.
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="m-0 mb-2 text-sm text-slate-600">
          표시 건수: {filteredRows.length.toLocaleString()} / 원본 건수: {rows.length.toLocaleString()}
        </p>
        <ul className="grid max-h-72 gap-1 overflow-auto text-sm">
          {filteredRows.slice(0, 120).map((row) => (
            <li key={row.id} className="rounded border border-slate-100 px-2 py-1">
              {row.label}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}