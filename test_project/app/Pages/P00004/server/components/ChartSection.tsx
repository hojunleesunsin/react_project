import { getChartRows } from "../dashboard-data";
import type { FilterValues } from "../../form-state";
import { SalesChart } from "../../components/SalesChart";

export async function ChartSection({ filters }: { filters: FilterValues }) {
  const rows = await getChartRows(filters);
  return <SalesChart rows={rows} />;
}

