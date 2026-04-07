import type { FilterValues, Row } from "../form-state";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function makeMockRows(filters: FilterValues): Row[] {
  const days = filters.period === "7d" ? 7 : filters.period === "30d" ? 30 : 90;
  const categoryOffset = filters.category === "A" ? 120 : filters.category === "B" ? -80 : 0;
  const endDate = new Date("2026-03-31T00:00:00.000Z");
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - (days - 1));

  return Array.from({ length: days }, (_, i) => {
    const current = new Date(startDate);
    current.setUTCDate(startDate.getUTCDate() + i);
    return {
      date: formatDate(current),
      sales: 1000 + i * 13 + categoryOffset,
      orders: 20 + (i % 7),
    };
  });
}

export function parseFilters(input: {
  period?: string | null;
  category?: string | null;
}): FilterValues {
  const period = input.period === "7d" || input.period === "30d" || input.period === "90d"
    ? input.period
    : "30d";
  const category = input.category === "A" || input.category === "B" || input.category === "all"
    ? input.category
    : "all";
  return { period, category };
}

export async function getChartRows(filters: FilterValues): Promise<Row[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return makeMockRows(filters);
}

export async function getGridRows(filters: FilterValues): Promise<Row[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return makeMockRows(filters);
}

export async function getSlowChartRows(filters: FilterValues): Promise<Row[]> {
  await new Promise((resolve) => setTimeout(resolve, 2200));
  return makeMockRows(filters).map((row, index) => ({
    ...row,
    sales: Math.round(row.sales * 0.9 + (index % 9) * 18),
  }));
}

