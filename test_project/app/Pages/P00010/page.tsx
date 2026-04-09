"use client";

import { useState, useTransition } from "react";
import { submitTextAction, type EchoData } from "./actions";

export default function Page() {
  const [input, setInput] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [result, setResult] = useState<EchoData | null>(null);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  if (fatalError) {
    throw fatalError;
  }

  const onSubmit = () => {
    startTransition(() => {
      void (async () => {
        setFieldError("");
        const actionResult = await submitTextAction(input);

        if (!actionResult.ok) {
          setResult(null);
          setFieldError(actionResult.fieldError);
          return;
        }

        setResult(actionResult.data);
      })().catch((error: unknown) => {
        setFatalError(error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다."));
      });
    });
  };

  return (
    <main className="mx-auto mt-10 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="m-0 text-2xl font-bold">P00010 - 실무형 에러 처리 예제</h1>
      <p className="mb-4 mt-2 text-sm text-slate-600">
        검증 오류는 이 화면에서 안내하고, 예외는 같은 경로의 <code>error.tsx</code>에서 처리합니다.
      </p>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="grid gap-1 text-sm font-semibold">
          텍스트 입력
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="문자열을 입력하세요"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
          />
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className={`w-fit rounded-md px-4 py-2 text-sm font-semibold text-white ${
            isPending ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPending ? "처리 중..." : "제출"}
        </button>

        {fieldError ? <p className="m-0 text-sm font-medium text-red-600">{fieldError}</p> : null}
        <p className="m-0 text-xs text-slate-500">
          테스트: 빈 입력은 검증 오류, <code>crash</code> 입력은 error.tsx로 이동합니다.
        </p>
      </section>

      {result ? (
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <p className="m-0">
            <strong>원문:</strong> {result.original}
          </p>
          <p className="m-0 mt-1">
            <strong>대문자:</strong> {result.uppercased}
          </p>
          <p className="m-0 mt-1">
            <strong>길이:</strong> {result.length}
          </p>
        </section>
      ) : null}
    </main>
  );
}

