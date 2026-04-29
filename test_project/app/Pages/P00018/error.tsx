"use client";

// error.tsx 는 반드시 "use client" 여야 합니다.
// Next.js App Router 에서 같은 폴더의 page.tsx 에서 발생한 에러를 여기서 잡아줍니다.
//
// 에러가 여기 도달하는 경우:
//   1. throwOnError: true 로 설정된 useQuery 에서 서버 액션이 실패한 경우
//   2. 렌더링 중 throw 된 예외 (런타임 에러)
//   3. 서버 컴포넌트에서 처리되지 않은 에러
//
// 에러가 여기 도달하지 않는 경우 (인라인 처리):
//   - throwOnError: false (기본값) 인 useQuery 의 isError
//   - useMutation 의 onError 콜백
//   - try/catch 로 직접 처리한 경우

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string }; // digest 는 서버 에러의 고유 해시값
  reset: () => void;                  // 호출 시 페이지 세그먼트를 재렌더링합니다
};

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    // 실무에서는 여기서 Sentry / Datadog 같은 에러 추적 서비스로 에러를 전송합니다
    console.error("[P00018 Error Boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-lg">

        {/* 아이콘 + 제목 */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              페이지 오류가 발생했습니다
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              이 화면은 <code className="rounded bg-slate-100 px-1">error.tsx</code> 가
              렌더링된 것입니다. React Error Boundary 가 에러를 캐치했습니다.
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
        <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
            Error Message
          </p>
          <p className="mt-1 font-mono text-sm text-red-700">{error.message}</p>

          {/* digest: 서버 에러의 경우 Next.js 가 자동으로 부여하는 해시 (로그 추적용) */}
          {error.digest && (
            <p className="mt-2 text-xs text-red-400">
              digest: <code>{error.digest}</code>
            </p>
          )}
        </div>

        {/* 에러 처리 흐름 설명 */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">이 에러가 여기 온 이유</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4">
            <li>서버 액션 내부에서 에러가 throw 됨</li>
            <li>
              <code>useQuery</code>의 <code>throwOnError: true</code> 옵션이
              에러를 re-throw
            </li>
            <li>React Error Boundary 가 캐치 → <code>error.tsx</code> 렌더링</li>
          </ol>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            다시 시도 (reset)
          </button>
          <a
            href="/Pages/P00018"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            페이지 새로 열기
          </a>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          &quot;다시 시도&quot;는 <code>reset()</code>을 호출해 페이지를
          재렌더링합니다. &quot;페이지 새로 열기&quot;는 URL 을 통해 완전히
          새로 로드합니다.
        </p>
      </div>
    </main>
  );
}
