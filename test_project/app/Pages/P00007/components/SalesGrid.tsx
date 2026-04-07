"use client";

import type { Row } from "../form-state";

export function SalesGrid({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="px-2.5 py-2.5 text-left">날짜</th>
            <th className="px-2.5 py-2.5 text-right">매출</th>
            <th className="px-2.5 py-2.5 text-right">주문수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={`${r.date}-${idx}`}>
              <td className="border-t border-slate-100 px-2.5 py-2.5 dark:border-slate-700">{r.date}</td>
              <td className="border-t border-slate-100 px-2.5 py-2.5 text-right dark:border-slate-700">{r.sales}</td>
              <td className="border-t border-slate-100 px-2.5 py-2.5 text-right dark:border-slate-700">{r.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

