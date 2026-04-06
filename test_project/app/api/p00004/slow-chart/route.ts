import { NextResponse } from "next/server";
import { getSlowChartRows, parseFilters } from "@/app/Pages/P00004/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseFilters({
    period: searchParams.get("period"),
    category: searchParams.get("category"),
  });
  const rows = await getSlowChartRows(filters);
  return NextResponse.json({ rows });
}

