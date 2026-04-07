import { Suspense } from "react";
import { FilterForm } from "./server/components/FilterForm";
import { ChartSection } from "./server/components/ChartSection";
import { GridSection } from "./server/components/GridSection";
import { SlowChartSection } from "./server/components/SlowChartSection";
import { parseFilters } from "./server/dashboard-data";
import { ClientUiShell } from "./components/ClientUiShell";

type PageProps = {
  searchParams?: Promise<{ period?: string; category?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const filters = parseFilters({
    period: sp.period,
    category: sp.category,
  });

  return (
    <ClientUiShell>
      <main className="flex min-h-screen">
        <FilterForm filters={filters} />

        <section className="grid flex-1 gap-4 p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="m-0 text-2xl font-semibold">매출 대시보드 (서버 컴포넌트)</h2>
            <p className="mb-0 mt-2 text-slate-600 dark:text-slate-300">
              서버 함수로 데이터를 읽고, 서버 액션으로 필터를 적용합니다.
            </p>
            <p className="mb-0 mt-1 text-slate-600 dark:text-slate-300">현재 조건: {filters.period} / {filters.category}</p>
          </div>

          <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">차트 로딩...</div>}>
            <ChartSection filters={filters} />
          </Suspense>

          <Suspense
            fallback={<div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">느린 차트 로딩...</div>}
          >
            <SlowChartSection filters={filters} />
          </Suspense>

          <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">그리드 로딩...</div>}>
            <GridSection filters={filters} />
          </Suspense>
        </section>
      </main>
    </ClientUiShell>
  );
}