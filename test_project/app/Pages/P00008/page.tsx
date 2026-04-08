"use client";

import { useState, useTransition } from "react";
import { saveNoteAction, type SaveNoteResult } from "./actions";

export default function Page() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitCount, setSubmitCount] = useState(0);
  const [result, setResult] = useState<SaveNoteResult>({
    ok: false,
    message: "",
    values: { title: "", description: "" },
    errors: {},
  });
  const [isPending, startTransition] = useTransition();

  const onClickSave = () => {
    startTransition(async () => {
      const response = await saveNoteAction({ title, description });
      setSubmitCount((prev) => prev + 1);
      setResult(response);
    });
  };

  return (
    <main className="mx-auto mt-10 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold">P00008 - Client Direct Server Action Call</h1>
      <p className="mb-5 text-sm text-slate-600">
        form action 없이, 클라이언트 버튼 클릭에서 서버 액션을 직접 호출하는 예제입니다.
      </p>

      <div className="grid gap-4">
        <div className="grid gap-1">
          <label htmlFor="title" className="text-sm font-semibold">
            제목
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="제목 입력"
          />
          {result.errors.title ? <p className="text-xs text-red-600">{result.errors.title}</p> : null}
        </div>

        <div className="grid gap-1">
          <label htmlFor="description" className="text-sm font-semibold">
            설명
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 rounded-md border border-slate-300 px-3 py-2"
            placeholder="설명 입력"
          />
          {result.errors.description ? (
            <p className="text-xs text-red-600">{result.errors.description}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClickSave}
          disabled={isPending}
          className={`rounded-md px-4 py-2 font-semibold text-white ${
            isPending ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
      </div>

      <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm">
        <p className="m-0">
          제출 횟수: <strong>{submitCount}</strong>
        </p>
        <p className={`m-0 mt-1 font-semibold ${result.ok ? "text-emerald-700" : "text-slate-700"}`}>
          {result.message || "아직 제출하지 않았습니다."}
        </p>
      </div>
    </main>
  );
}

