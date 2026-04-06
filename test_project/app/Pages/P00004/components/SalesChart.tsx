"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import type { Row } from "../form-state";

export function SalesChart({
  rows,
  isDark,
  isLoading,
  title = "매출 추이",
  loadingText = "차트 로딩 중...",
  lineColor = "#2563eb",
}: {
  rows: Row[];
  isDark: boolean;
  isLoading: boolean;
  title?: string;
  loadingText?: string;
  lineColor?: string;
}) {
  return (
    <div
      className={`h-80 rounded-xl border p-4 shadow-sm ${
        isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="m-0 font-semibold">{title}</h4>
        {isLoading && (
          <span className={isDark ? "text-xs text-amber-300" : "text-xs text-amber-700"}>
            {loadingText}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
          <XAxis dataKey="date" hide />
          <YAxis width={70} />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke={lineColor} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}