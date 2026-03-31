"use client";

import { useDeferredValue, useMemo, useState } from "react";

const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

export default function SearchList() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(
    () => items.filter((item) =>
      item.toLowerCase().includes(deferredQuery.toLowerCase())
    ),
    [deferredQuery]
  );

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검색..." />
      <ul>{filtered.slice(0, 50).map((v) => <li key={v}>{v}</li>)}</ul>
    </div>
  );
}