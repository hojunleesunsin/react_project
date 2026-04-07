"use server";

import type { FilterValues, Row } from "./form-state";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function makeRows(filters: FilterValues): Row[] {
  const days = filters.period === "7d" ? 7 : filters.period === "30d" ? 30 : 90;
  const categoryOffset = filters.category === "A" ? 120 : filters.category === "B" ? -80 : 0;
  const endDate = new Date("2026-06-30T00:00:00.000Z");
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - (days - 1));

  return Array.from({ length: days }, (_, i) => {
    const current = new Date(startDate);
    current.setUTCDate(startDate.getUTCDate() + i);
    return {
      date: formatDate(current),
      sales: 1000 + i * 11 + categoryOffset,
      orders: 20 + (i % 7),
    };
  });
}

export async function loadChartAction(filters: FilterValues): Promise<Row[]> {
  await new Promise((r) => setTimeout(r, 500));
  return makeRows(filters);
}

export async function loadGridAction(filters: FilterValues): Promise<Row[]> {
  await new Promise((r) => setTimeout(r, 900));
  return makeRows(filters);
}

export async function loadSlowChartAction(filters: FilterValues): Promise<Row[]> {
  await new Promise((r) => setTimeout(r, 1700));
  return makeRows(filters).map((row, i) => ({
    ...row,
    sales: Math.round(row.sales * 0.9 + (i % 10) * 16),
  }));
}

