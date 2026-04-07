export type FilterValues = {
  period: "7d" | "30d" | "90d";
  category: "all" | "A" | "B";
};

export type Row = {
  date: string;
  sales: number;
  orders: number;
};

export type DashboardPayload = {
  filters: FilterValues;
  chartRows: Row[];
  slowChartRows: Row[];
  gridRows: Row[];
  message: string;
  durationMs: number;
};

