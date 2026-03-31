"use client";

import { useMemo, useState, useTransition } from "react";

const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

export default function SearchList() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => items.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setQuery(value); // 무거운 렌더를 transition으로 처리
    });
  };

  return (
    <div>
      <input onChange={onChange} placeholder="검색..." />
      {isPending && <p>검색 중...</p>}
      <ul>{filtered.slice(0, 50).map((v) => <li key={v}>{v}</li>)}</ul>
    </div>
  );
}