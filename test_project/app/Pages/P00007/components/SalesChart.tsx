"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Row } from "../form-state";

type Props = {
  rows: Row[];
  title?: string;
  lineColor?: string;
};

export function SalesChart({ rows, title = "매출 추이", lineColor = "#2563eb" }: Props) {
  return (
    <div className="h-80 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h4 className="mb-2.5 mt-0 font-semibold">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={rows}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis width={70} />
          <Tooltip />
          <Line dataKey="sales" dot={false} stroke={lineColor} strokeWidth={2.5} type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

