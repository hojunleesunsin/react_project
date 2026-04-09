"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("P00009 error boundary:", error);
  }, [error]);

  return (
    <main className="mx-auto mt-10 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <h1 className="m-0 text-2xl font-bold text-red-800">P00009 오류 화면</h1>
      <p className="mb-3 mt-2 text-sm text-red-700">
        use(promise) 흐름에서 발생한 예외를 P00009/error.tsx가 처리했습니다.
      </p>
      <pre className="overflow-auto rounded-md bg-white p-3 text-xs text-slate-700">
        {error.message || "알 수 없는 오류"}
      </pre>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        다시 시도
      </button>
    </main>
  );
}

