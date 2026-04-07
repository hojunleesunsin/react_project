"use client";

import { useEffect, useMemo, useState } from "react";
import { loadChartAction, loadGridAction, loadSlowChartAction } from "./actions";
import type { FilterValues, Row } from "./form-state";
import { ClientUiShell } from "./components/ClientUiShell";
import { SalesChart } from "./components/SalesChart";
import { SalesGrid } from "./components/SalesGrid";

const INITIAL_FILTERS: FilterValues = { period: "30d", category: "all" };

export default function Page() {
  const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS);
  const [chartRows, setChartRows] = useState<Row[]>([]);
  const [slowChartRows, setSlowChartRows] = useState<Row[]>([]);
  const [gridRows, setGridRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("아직 조회하지 않았습니다. 버튼을 눌러 서버 액션을 실행하세요.");
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [isSlowChartLoading, setIsSlowChartLoading] = useState(false);

  const totalSales = useMemo(
    () => gridRows.reduce((sum, row) => sum + row.sales, 0),
    [gridRows]
  );

  const onSearch = async () => {
    const startedAt = Date.now();
    setMessage("서버 액션 3개를 병렬 호출했습니다. 먼저 완료된 위젯부터 표시됩니다.");
    setDurationMs(null);
    setIsChartLoading(true);
    setIsGridLoading(true);
    setIsSlowChartLoading(true);

    const chartTask = (async () => {
      try {
        const rows = await loadChartAction(filters);
        setChartRows(rows);
      } finally {
        setIsChartLoading(false);
      }
    })();

    const gridTask = (async () => {
      try {
        const rows = await loadGridAction(filters);
        setGridRows(rows);
      } finally {
        setIsGridLoading(false);
      }
    })();

    const slowChartTask = (async () => {
      try {
        const rows = await loadSlowChartAction(filters);
        setSlowChartRows(rows);
      } finally {
        setIsSlowChartLoading(false);
      }
    })();

    await Promise.all([chartTask, gridTask, slowChartTask]);
    setDurationMs(Date.now() - startedAt);
  };

  useEffect(() => {
    onSearch();
  }, []);

  return (
    <ClientUiShell>
      <main className="flex min-h-screen">
        <aside className="w-[280px] border-r border-slate-200 bg-white p-5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <h3 className="mb-2 mt-0 text-lg font-semibold">필터</h3>
          <p className="mb-4 mt-0 text-xs text-slate-500 dark:text-slate-400">
            클라이언트가 서버 액션 함수를 직접 호출하는 예제입니다.
          </p>

          <div className="grid gap-3">
            <label className="mb-1.5 block font-semibold">기간</label>
            <select
              value={filters.period}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, period: e.target.value as FilterValues["period"] }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
            </select>

            <label className="mb-1.5 block font-semibold">카테고리</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value as FilterValues["category"] }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">전체</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>

            <button
              type="button"
              onClick={onSearch}
              disabled={isChartLoading || isGridLoading || isSlowChartLoading}
              className={`mt-1 w-full rounded-lg px-3 py-2 font-semibold text-white ${
                isChartLoading || isGridLoading || isSlowChartLoading
                  ? "bg-slate-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isChartLoading || isGridLoading || isSlowChartLoading ? "조회 중..." : "조회"}
            </button>
          </div>
        </aside>

        <section className="grid flex-1 gap-4 p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="m-0 text-2xl font-semibold">매출 대시보드 (클라이언트에서 서버 액션 직접 호출)</h2>
            <p className="mb-0 mt-2 text-slate-600 dark:text-slate-300">{message}</p>
            <p className="mb-0 mt-1 text-slate-600 dark:text-slate-300">
              상태: {isChartLoading || isGridLoading || isSlowChartLoading ? "조회 중..." : "대기"} / 처리시간:{" "}
              {durationMs ?? "-"}ms / 총 매출: {totalSales.toLocaleString()}
            </p>
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="m-0 font-semibold">P00004 vs P00007 차이</p>
              <p className="m-0 mt-1 text-slate-600 dark:text-slate-300">
                P00004: 서버 컴포넌트에서 데이터 조회 후 렌더 / P00007: 클라이언트가 서버 액션을 직접 호출해 결과 상태를 갱신
              </p>
            </div>
          </div>

          <SalesChart
            rows={chartRows}
            title={isChartLoading ? "매출 추이 (로딩 중...)" : "매출 추이"}
          />
          <SalesChart
            rows={slowChartRows}
            title={isSlowChartLoading ? "고비용 매출 차트 (느린 쿼리, 로딩 중...)" : "고비용 매출 차트 (느린 쿼리)"}
            lineColor="#7c3aed"
          />
          <div>
            {isGridLoading && <p className="mb-2 text-sm text-amber-700 dark:text-amber-300">그리드 로딩 중...</p>}
            <SalesGrid rows={gridRows} />
          </div>
        </section>
      </main>
    </ClientUiShell>
  );
}

