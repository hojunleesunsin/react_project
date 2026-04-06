"use client";

// 이 파일의 훅 요약:
// - useState: UI/데이터/로딩 상태를 독립적으로 관리
// - useMemo: 그리드 데이터 기반 파생값(총매출/총주문/평균) 메모이제이션
// - useEffectEvent: interval 콜백에서 최신 theme/filters 참조 (stale closure 방지)
// - useEffect: interval 구독/해제 수명주기 관리
import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import { FilterPanel } from "./components/FilterPanel";
import { SalesChart } from "./components/SalesChart";
import { SalesGrid } from "./components/SalesGrid";
import type { FilterValues, Row } from "./form-state";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

const INITIAL_FILTERS: FilterValues = { period: "30d", category: "all" };

export function DashboardClient() {
  // useState: 대시보드의 각 영역 상태를 분리해 "먼저 끝난 위젯부터 렌더"를 가능하게 함
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [chartRows, setChartRows] = useState<Row[]>([]);
  const [slowChartRows, setSlowChartRows] = useState<Row[]>([]);
  const [gridRows, setGridRows] = useState<Row[]>([]);
  const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS);
  const [submitCount, setSubmitCount] = useState(0);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const [recentFilters, setRecentFilters] = useState<string[]>([]);
  const [message, setMessage] = useState("초기 데이터 로딩 중 - 먼저 끝난 위젯부터 표시됩니다.");
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isSlowChartLoading, setIsSlowChartLoading] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [effectLogs, setEffectLogs] = useState<string[]>([]);

  // useMemo: 렌더마다 전체 합계를 재계산하지 않도록 최적화
  const totalSales = useMemo(
    () => gridRows.reduce((sum, row) => sum + row.sales, 0),
    [gridRows]
  );
  const totalOrders = useMemo(
    () => gridRows.reduce((sum, row) => sum + row.orders, 0),
    [gridRows]
  );
  const avgOrder = gridRows.length > 0 ? Math.round(totalSales / totalOrders) : 0;

  const isDark = theme === "dark";
  const fontSizeClass =
    fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-base";
  const cardClass = isDark
    ? "rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm"
    : "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";

  // useEffectEvent: interval은 재등록하지 않으면서도 최신 state를 읽는 이벤트 핸들러
  const onHeartbeat = useEffectEvent(() => {
    const line = `[${new Date().toLocaleTimeString()}] theme=${theme}, filters=${filters.period}/${filters.category}`;
    setEffectLogs((prev) => [line, ...prev].slice(0, 6));
  });

  // useEffect: interval 구독/해제만 담당 (콜백 로직은 useEffectEvent로 분리)
  useEffect(() => {
    const timer = setInterval(() => {
      onHeartbeat();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchWidgets = useCallback((nextFilters: FilterValues) => {
    const { period, category } = nextFilters;

    setIsChartLoading(true);
    setIsSlowChartLoading(true);
    setIsGridLoading(true);

    const query = `period=${period}&category=${category}`;

    void fetch(`/api/p00004/chart?${query}`)
      .then(async (res) => {
        const json = (await res.json()) as { rows: Row[] };
        setChartRows(json.rows);
      })
      .finally(() => {
        setIsChartLoading(false);
      });

    void fetch(`/api/p00004/grid?${query}`)
      .then(async (res) => {
        const json = (await res.json()) as { rows: Row[] };
        setGridRows(json.rows);
      })
      .finally(() => {
        setIsGridLoading(false);
      });

    void fetch(`/api/p00004/slow-chart?${query}`)
      .then(async (res) => {
        const json = (await res.json()) as { rows: Row[] };
        setSlowChartRows(json.rows);
      })
      .finally(() => {
        setIsSlowChartLoading(false);
      });
  }, []);

  useEffect(() => {
    // 페이지 진입 직후, 화면은 먼저 표시하고 데이터는 이후 병렬로 로드
    const timer = setTimeout(() => {
      fetchWidgets(INITIAL_FILTERS);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchWidgets]);

  function handleSearch() {
    const { period, category } = filters;
    setSubmitCount((prev) => prev + 1);
    setLastSubmittedAt(new Date().toISOString());
    setRecentFilters((prev) => [`${period} / ${category}`, ...prev].slice(0, 5));
    setMessage("조회 요청 중 - 빠른 데이터부터 먼저 표시됩니다.");
    fetchWidgets(filters);
  }

  return (
    <div
      className={`flex min-h-screen ${fontSizeClass} ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
        isSubmitting={isChartLoading || isGridLoading || isSlowChartLoading}
        isDark={isDark}
      />

      <section className="grid flex-1 gap-4 p-6">
        <div className={cardClass}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-2xl font-semibold">매출 대시보드</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  isDark ? "bg-slate-700 text-slate-100" : "bg-slate-200 text-slate-800"
                }`}
              >
                {isDark ? "라이트 모드" : "다크 모드"}
              </button>
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  fontSize === "sm" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-800"
                }`}
              >
                글자 작게
              </button>
              <button
                type="button"
                onClick={() => setFontSize("md")}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  fontSize === "md" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-800"
                }`}
              >
                글자 보통
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  fontSize === "lg" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-800"
                }`}
              >
                글자 크게
              </button>
            </div>
          </div>
          <p className={isDark ? "m-0 text-slate-300" : "m-0 text-slate-500"}>
            초기 데이터는 서버에서 로드하고, 조회 시 차트/그리드를 독립적으로 갱신합니다.
          </p>
          <p className={isDark ? "mb-0 text-slate-300" : "mb-0 text-slate-500"}>
            최근 조회 횟수: <strong>{submitCount}</strong> / 마지막 조회:{" "}
            {lastSubmittedAt ? formatDateTime(lastSubmittedAt) : "-"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className={cardClass}>
            <p className={isDark ? "m-0 text-xs text-slate-300" : "m-0 text-xs text-slate-500"}>총 매출</p>
            <p className="mb-0 mt-2 text-2xl font-bold">{numberFormatter.format(totalSales)}</p>
          </div>
          <div className={cardClass}>
            <p className={isDark ? "m-0 text-xs text-slate-300" : "m-0 text-xs text-slate-500"}>총 주문수</p>
            <p className="mb-0 mt-2 text-2xl font-bold">{numberFormatter.format(totalOrders)}</p>
          </div>
          <div className={cardClass}>
            <p className={isDark ? "m-0 text-xs text-slate-300" : "m-0 text-xs text-slate-500"}>평균 객단가</p>
            <p className="mb-0 mt-2 text-2xl font-bold">{numberFormatter.format(avgOrder)}</p>
          </div>
        </div>

        {message && (
          <p className={`m-0 font-semibold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
            {message} - 현재 조건: {filters.period} / {filters.category}
          </p>
        )}

        {recentFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recentFilters.map((filter, idx) => (
              <span
                key={`${filter}-${idx}`}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  isDark ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                최근조회 {idx + 1}: {filter}
              </span>
            ))}
          </div>
        )}

        <SalesChart rows={chartRows} isDark={isDark} isLoading={isChartLoading} />
        <SalesChart
          rows={slowChartRows}
          isDark={isDark}
          isLoading={isSlowChartLoading}
          title="고비용 매출 차트 (느린 쿼리)"
          loadingText="느린 차트 로딩 중..."
          lineColor="#7c3aed"
        />
        <SalesGrid rows={gridRows} isDark={isDark} isLoading={isGridLoading} />

        <div className={cardClass}>
          <h3 className="mb-2 mt-0 text-lg font-semibold">useEffectEvent 예시</h3>
          <p className={isDark ? "mb-2 mt-0 text-sm text-slate-300" : "mb-2 mt-0 text-sm text-slate-600"}>
            interval 연결은 한 번만 유지하고, 콜백에서는 최신 theme/filters 값을 안전하게 읽습니다.
          </p>
          {effectLogs.length === 0 ? (
            <p className={isDark ? "m-0 text-sm text-slate-400" : "m-0 text-sm text-slate-500"}>
              5초마다 로그가 쌓입니다.
            </p>
          ) : (
            <ul className="m-0 list-disc space-y-1 pl-5">
              {effectLogs.map((log, idx) => (
                <li key={`${log}-${idx}`} className={isDark ? "text-sm text-slate-200" : "text-sm text-slate-700"}>
                  {log}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

