"use client";

import type { Row } from "../form-state";

export function SalesGrid({
  rows,
  isDark,
  isLoading,
}: {
  rows: Row[];
  isDark: boolean;
  isLoading: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-sm ${
        isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className={`px-3 py-2 text-xs ${isDark ? "text-amber-300" : "text-amber-700"}`}>
        {isLoading ? "그리드 로딩 중..." : "그리드 로드 완료"}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className={isDark ? "bg-slate-800" : "bg-slate-50"}>
            <th className="px-2.5 py-2.5 text-left">날짜</th>
            <th className="px-2.5 py-2.5 text-right">매출</th>
            <th className="px-2.5 py-2.5 text-right">주문수</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className={`px-6 py-6 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                왼쪽 필터에서 조회를 실행해 데이터를 불러오세요.
              </td>
            </tr>
          ) : null}
          {rows.map((r, idx) => (
            <tr key={`${r.date}-${idx}`}>
              <td className={`px-2.5 py-2.5 ${isDark ? "border-t border-slate-700" : "border-t border-slate-100"}`}>
                {r.date}
              </td>
              <td
                className={`px-2.5 py-2.5 text-right ${
                  isDark ? "border-t border-slate-700" : "border-t border-slate-100"
                }`}
              >
                {r.sales}
              </td>
              <td
                className={`px-2.5 py-2.5 text-right ${
                  isDark ? "border-t border-slate-700" : "border-t border-slate-100"
                }`}
              >
                {r.orders}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}