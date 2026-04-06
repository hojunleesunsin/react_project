"use server";

import { getChartRows, getGridRows, getSlowChartRows } from "./data";
import type { DashboardState } from "./form-state";
import { makeInitialDashboardState } from "./form-state";

export async function getInitialDashboardState(): Promise<DashboardState> {
  const initial = makeInitialDashboardState();
  const [chartRows, slowChartRows, gridRows] = await Promise.all([
    getChartRows(initial.filters),
    getSlowChartRows(initial.filters),
    getGridRows(initial.filters),
  ]);

  return {
    ...initial,
    chartRows,
    slowChartRows,
    gridRows,
    message: "초기 데이터 로드 완료",
    submitCount: 1,
    lastSubmittedAt: new Date().toISOString(),
    recentFilters: [`${initial.filters.period} / ${initial.filters.category}`],
  };
}