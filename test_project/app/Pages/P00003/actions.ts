"use server";

export type SearchRow = {
  id: number;
  label: string;
  group: "A" | "B" | "C";
};

export async function loadSearchRowsAction(keyword: string): Promise<SearchRow[]> {
  const normalized = keyword.trim().toLowerCase();

  await new Promise((resolve) => setTimeout(resolve, 800));

  const rows = Array.from({ length: 12000 }, (_, i) => {
    const group = i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C";
    return {
      id: i + 1,
      label: `Item ${i + 1} - ${group}`,
      group,
    } as SearchRow;
  });

  if (!normalized) return rows;
  return rows.filter((row) => row.label.toLowerCase().includes(normalized));
}

