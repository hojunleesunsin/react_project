import type { FilterValues } from "../../form-state";
import { applyFiltersAction } from "../../actions/dashboard-actions";

export function FilterForm({ filters }: { filters: FilterValues }) {
  return (
    <aside className="w-[280px] border-r border-slate-200 bg-white p-5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <h3 className="mb-2 mt-0 text-lg font-semibold">필터</h3>
      <p className="mb-4 mt-0 text-xs text-slate-500 dark:text-slate-400">
        서버 액션(form action)으로 조건을 적용합니다.
      </p>

      <form action={applyFiltersAction} className="grid gap-3">
        <label className="mb-1.5 block font-semibold">기간</label>
        <select
          name="period"
          defaultValue={filters.period}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="7d">최근 7일</option>
          <option value="30d">최근 30일</option>
          <option value="90d">최근 90일</option>
        </select>

        <label className="mb-1.5 block font-semibold">카테고리</label>
        <select
          name="category"
          defaultValue={filters.category}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="all">전체</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>

        <button
          type="submit"
          className="mt-1 w-full rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700"
        >
          조회
        </button>
      </form>
    </aside>
  );
}

