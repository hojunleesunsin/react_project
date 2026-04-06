export type FilterValues = {
  period: "7d" | "30d" | "90d";
  category: "all" | "A" | "B";
};

export type Row = {
  date: string;
  sales: number;
  orders: number;
};

export type DashboardState = {
  filters: FilterValues;
  chartRows: Row[];
  slowChartRows: Row[];
  gridRows: Row[];
  message: string;
  submitCount: number;
  lastSubmittedAt: string | null;
  recentFilters: string[];
};

export function makeInitialDashboardState(): DashboardState {
  return {
    filters: { period: "30d", category: "all" },
    chartRows: [],
    slowChartRows: [],
    gridRows: [],
    message: "",
    submitCount: 0,
    lastSubmittedAt: null,
    recentFilters: [],
  };
}