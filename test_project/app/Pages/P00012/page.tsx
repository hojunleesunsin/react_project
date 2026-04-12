"use client";

import { useState } from "react";
import { PropSyncChild } from "./PropSyncChild";

const RECORDS = {
  a: { label: "레코드 A", title: "문서 A에서 온 제목" },
  b: { label: "레코드 B", title: "문서 B에서 온 제목" },
} ;

type RecordId = keyof typeof RECORDS;

/**
 * 부모: props로 `valueFromParent` / `recordLabel` 만 전달.
 * (key 리셋 예시는 아래 JSX 주석 참고)
 */
export default function Page() {
  const [recordId, setRecordId] = useState<RecordId>("a");
  const current = RECORDS[recordId];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">P00012 — props 전달 + 자식에서 이전 prop 보정</h1>
          <p className="mt-2 text-sm text-slate-600">
            부모는 <code className="rounded bg-slate-100 px-1">valueFromParent</code> 만 넘깁니다. 자식은{" "}
            <code className="rounded bg-slate-100 px-1">key</code> 없이, prop이 바뀌면 렌더 중{" "}
            <code className="rounded bg-slate-100 px-1">draft</code>를 맞춥니다.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">부모 (page.tsx)</h2>
          <p className="mt-1 text-sm text-slate-600">
            아래 버튼으로 <code className="rounded bg-slate-100 px-1">recordId</code>를 바꾸면{" "}
            <code className="rounded bg-slate-100 px-1">valueFromParent</code> prop이 바뀝니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(RECORDS) as RecordId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  recordId === id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
                onClick={() => setRecordId(id)}
              >
                {RECORDS[id].label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            현재 넘기는 props:{" "}
            <code className="rounded bg-slate-100 px-1">valueFromParent=&quot;{current.title}&quot;</code>
          </p>
        </section>

        <section>
          <PropSyncChild valueFromParent={current.title} recordLabel={current.label} />
          {/*
            key 리셋 방식 (레코드 바뀔 때 자식 전체 리마운트 — useEffect/이전 prop 비교 불필요):
            <PropSyncChild
              key={recordId}
              valueFromParent={current.title}
              recordLabel={current.label}
            />
          */}
        </section>

        <footer className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-medium text-slate-800">참고</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li>
              자식 코드는 <code className="rounded bg-white px-1">PropSyncChild.tsx</code> 에 있습니다.
            </li>
            <li>
              위 자식은 <strong>렌더 중 이전 prop 보정</strong> 방식입니다.{" "}
              <code className="rounded bg-white px-1">key=&#123;recordId&#125;</code> 는 JSX 안 주석으로 예시만
              남겨 두었습니다.
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
