"use server";

import { redirect } from "next/navigation";
import { parseFilters } from "../server/dashboard-data";

export async function applyFiltersAction(formData: FormData) {
  const filters = parseFilters({
    period: String(formData.get("period") ?? ""),
    category: String(formData.get("category") ?? ""),
  });

  redirect(`/Pages/P00004?period=${filters.period}&category=${filters.category}`);
}

