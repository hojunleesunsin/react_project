"use client";
import type { FilterValues } from "../form-state";

type Props = {
  filters: FilterValues;
  onFilterChange: (next: FilterValues) => void;
  onSearch: () => void;
  isSubmitting: boolean;
};

export function FilterPanel({
  filters,
  onFilterChange,
  onSearch,
  isSubmitting,
  isDark,
}: Props & { isDark: boolean }) {
  return (
    <aside
      className={`w-[280px] border-r p-5 ${
        isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <h3 className="mt-0 mb-2 text-lg font-semibold">필터</h3>
      <p className={`mt-0 mb-4 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        조회 조건을 선택한 후 데이터를 불러오세요.
      </p>

      <label className="mb-1.5 block font-semibold">기간</label>
      <select
        name="period"
        value={filters.period}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            period: e.target.value as FilterValues["period"],
          })
        }
        className={`mb-3 w-full rounded-lg border px-3 py-2 ${
          isDark
            ? "border-slate-600 bg-slate-800 text-slate-100"
            : "border-slate-300 bg-white text-slate-900"
        }`}
      >
        <option value="7d">최근 7일</option>
        <option value="30d">최근 30일</option>
        <option value="90d">최근 90일</option>
      </select>

      <label className="mb-1.5 block font-semibold">카테고리</label>
      <select
        name="category"
        value={filters.category}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            category: e.target.value as FilterValues["category"],
          })
        }
        className={`mb-3.5 w-full rounded-lg border px-3 py-2 ${
          isDark
            ? "border-slate-600 bg-slate-800 text-slate-100"
            : "border-slate-300 bg-white text-slate-900"
        }`}
      >
        <option value="all">전체</option>
        <option value="A">A</option>
        <option value="B">B</option>
      </select>

      <button
        type="button"
        onClick={onSearch}
        disabled={isSubmitting}
        className={`w-full rounded-lg px-3 py-2 font-semibold text-white ${
          isSubmitting ? "cursor-not-allowed bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "조회 중..." : "조회"}
      </button>
    </aside>
  );
}