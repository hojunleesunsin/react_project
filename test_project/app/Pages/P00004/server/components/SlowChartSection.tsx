import { getSlowChartRows } from "../dashboard-data";
import type { FilterValues } from "../../form-state";
import { SalesChart } from "../../components/SalesChart";

export async function SlowChartSection({ filters }: { filters: FilterValues }) {
  const rows = await getSlowChartRows(filters);
  return <SalesChart rows={rows} title="고비용 매출 차트 (느린 쿼리)" lineColor="#7c3aed" />;
}

