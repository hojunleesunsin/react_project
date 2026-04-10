"use client";

import { Suspense, use, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BarChartPoint = {
  label: string;
  value: number;
};

type BarChartCardProps = {
  title: string;
  dataPromise: Promise<BarChartPoint[]>;
  emptyMessage?: string;
  height?: number;
};

function BarChartSkeleton({ height }: { height: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2" style={{ height }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

function BarChartBody({
  title,
  dataPromise,
  emptyMessage,
  height,
}: Required<BarChartCardProps>) {
  const stablePromise = useMemo(() => dataPromise, [dataPromise]);
  const data = use(stablePromise);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {data.length ? (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export function BarChartCard({
  title,
  dataPromise,
  emptyMessage = "차트 데이터가 없습니다.",
  height = 240,
}: BarChartCardProps) {
  return (
    <Suspense fallback={<BarChartSkeleton height={height} />}>
      <BarChartBody
        title={title}
        dataPromise={dataPromise}
        emptyMessage={emptyMessage}
        height={height}
      />
    </Suspense>
  );
}
