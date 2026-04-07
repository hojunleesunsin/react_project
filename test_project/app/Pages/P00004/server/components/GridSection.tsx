import { getGridRows } from "../dashboard-data";
import type { FilterValues } from "../../form-state";
import { SalesGrid } from "../../components/SalesGrid";

export async function GridSection({ filters }: { filters: FilterValues }) {
  const rows = await getGridRows(filters);
  return <SalesGrid rows={rows} />;
}

