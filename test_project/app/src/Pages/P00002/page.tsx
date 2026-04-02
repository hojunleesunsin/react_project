"use client";

import { useMemo, useState, useTransition } from "react";

const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

export default function SearchList() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => items.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value); // 긴급 업데이트
    startTransition(() => setQuery(value)); // 비긴급(무거운) 업데이트
  };

  return (
    <div>
      <input value={input} onChange={onChange} placeholder="검색..." />
      {isPending && <p>검색 중...</p>}
      <ul>{filtered.slice(0, 50).map((v) => <li key={v}>{v}</li>)}</ul>
    </div>
  );
}