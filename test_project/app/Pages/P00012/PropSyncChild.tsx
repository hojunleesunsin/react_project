"use client";

import { useState } from "react";

export type PropSyncChildProps = {
  /** 부모에서 내려주는 값 — 바뀌면 로컬 draft를 맞춤 */
  valueFromParent: string;
  /** 화면 표시용 */
  recordLabel: string;
};

/**
 * key 없이 props만 넘길 때: `valueFromParent`가 바뀌었는지 **이전 prop과 비교**해 `draft`를 맞춤.
 * (React 문서의 “Adjusting state when a prop changes” 렌더 보정 패턴)
 *
 * 동일 동작을 **리마운트**만으로 하려면 부모에서 `key={recordId}` (page.tsx JSX 주석 참고).
 */
export function PropSyncChild({ valueFromParent, recordLabel }: PropSyncChildProps) {
  const [draft, setDraft] = useState(valueFromParent);
  const [prevFromParent, setPrevFromParent] = useState(valueFromParent);

  if (valueFromParent !== prevFromParent) {
    setPrevFromParent(valueFromParent);
    setDraft(valueFromParent);
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm">
      <p className="mb-2 font-medium text-amber-900">
        자식 컴포넌트 <span className="text-xs font-normal text-amber-800">(PropSyncChild)</span>
      </p>
      <p className="mb-2 text-xs text-amber-800">
        props: <code className="rounded bg-white px-1">recordLabel</code>={recordLabel},{" "}
        <code className="rounded bg-white px-1">valueFromParent</code>
      </p>
      <p className="mb-3 text-xs text-amber-700">
        <code className="rounded bg-white px-1">valueFromParent</code> ≠ 직전 prop 이면 렌더 중{" "}
        <code className="rounded bg-white px-1">setDraft</code>
      </p>
      <label className="mb-1 block text-xs text-amber-900">로컬 편집 (draft)</label>
      <input
        className="w-full rounded border border-amber-300 bg-white px-2 py-2 text-slate-900"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
    </div>
  );
}
