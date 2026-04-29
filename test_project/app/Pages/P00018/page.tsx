"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getEmployeesAction,
  toggleEmployeeStatusAction,
  getFatalDataAction,
  type Employee,
} from "./actions";

// QueryClient는 컴포넌트 외부에 두면 서버/클라이언트 경계에서 공유되어 버리므로
// useState로 생성해 인스턴스가 컴포넌트 생명주기에 묶이도록 합니다
function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30초간 캐시 유지
            // 모든 useQuery에서 에러 발생 시 자동으로 error.tsx로 전파
            // 개별 useQuery마다 throwOnError를 설정할 필요가 없습니다
            throwOnError: true,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default function Page() {
  return (
    <Providers>
      <P00018Inner />
    </Providers>
  );
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
function P00018Inner() {
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFatalDemo, setShowFatalDemo] = useState(false);
  const queryClient = useQueryClient();

  // QueryClient defaultOptions 에 throwOnError: true 가 설정되어 있으므로
  // 이 쿼리에서 에러가 발생하면 별도 설정 없이 자동으로 error.tsx로 전파됩니다
  const {
    data: employees,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["p00018-employees", searchKeyword],
    queryFn: () => getEmployeesAction(searchKeyword),
  });

  // 직원 상태 토글 mutation
  const toggleMutation = useMutation({
    mutationFn: ({
      employeeId,
      isActive,
    }: {
      employeeId: number;
      isActive: "Y" | "N";
    }) => toggleEmployeeStatusAction(employeeId, isActive),
    onSuccess: () => {
      // 저장 성공 후 캐시 무효화 → 목록 자동 재조회
      queryClient.invalidateQueries({ queryKey: ["p00018-employees"] });
    },
    onError: (err) => {
      alert(`상태 변경 실패: ${err.message}`);
    },
  });

  const onSearch = () => setSearchKeyword(keyword);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-4">

        {/* 헤더 */}
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">
            P00018 – TanStack Query + 서버 액션
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            useQuery / useMutation 으로 서버 액션을 호출하고, 두 가지 에러 처리
            패턴을 비교합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-700">
              Pattern 1 – isError 인라인 처리
            </span>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-700">
              Pattern 2 – throwOnError → error.tsx 전파
            </span>
          </div>
        </header>

        {/* 검색 바 */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="이름 검색 (Enter or 조회 버튼)"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={onSearch}
              disabled={isLoading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
            >
              조회
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              새로고침
            </button>
          </div>
        </section>

        {/* ── Pattern 1: 직원 목록 (인라인 에러 처리) ── */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">직원 목록</h2>
            <code className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              throwOnError: true (전역) → 에러 시 error.tsx로 자동 전파
            </code>
          </div>

          {/* 로딩 */}
          {isLoading && (
            <div className="py-10 text-center text-sm text-slate-400">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              <p className="mt-2">데이터를 불러오는 중...</p>
            </div>
          )}

          {/* ── 에러 처리 Pattern 1: isError로 인라인 표시 ── */}
          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                조회 중 오류가 발생했습니다
              </p>
              <p className="mt-1 font-mono text-xs text-red-600">
                {error.message}
              </p>
              <p className="mt-2 text-xs text-red-500">
                → error.tsx 로 넘기지 않고 이 컴포넌트 안에서 직접 처리합니다.
                사용자가 페이지를 벗어나지 않고 재시도할 수 있습니다.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 데이터 테이블 */}
          {!isLoading && !isError && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                      ID
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                      로그인 ID
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                      이름
                    </th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-700">
                      상태
                    </th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-700">
                      상태 변경
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(employees ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        데이터가 없습니다. 조회 버튼을 눌러주세요.
                      </td>
                    </tr>
                  ) : (
                    (employees ?? []).map((emp: Employee) => (
                      <tr
                        key={emp.employeeId}
                        className="border-t border-slate-100 odd:bg-white even:bg-slate-50/50"
                      >
                        <td className="px-4 py-2.5 text-slate-500">
                          {emp.employeeId}
                        </td>
                        <td className="px-4 py-2.5">{emp.loginId}</td>
                        <td className="px-4 py-2.5 font-medium">
                          {emp.fullName}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              emp.isActive === "Y"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {emp.isActive === "Y" ? "활성" : "비활성"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() =>
                              toggleMutation.mutate({
                                employeeId: emp.employeeId,
                                isActive: emp.isActive,
                              })
                            }
                            disabled={toggleMutation.isPending}
                            className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
                          >
                            {toggleMutation.isPending ? "처리 중..." : "토글"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Pattern 2: throwOnError → error.tsx 전파 ── */}
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <div className="mb-2">
            <h2 className="font-semibold text-rose-900">
              error.tsx 전파 데모 (Pattern 2)
            </h2>
            <p className="mt-0.5 text-xs text-rose-700">
              아래 버튼을 누르면{" "}
              <code className="rounded bg-rose-100 px-1">
                throwOnError: true
              </code>
              로 설정된 쿼리가 실행됩니다. 서버 액션이 에러를 던지면 React
              Error Boundary (error.tsx) 로 전파되어 에러 화면이 렌더링됩니다.
            </p>
          </div>

          <div className="mt-3 rounded-md border border-rose-200 bg-white p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">동작 원리</p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-4">
              <li>서버 액션이 에러를 throw</li>
              <li>
                TanStack Query 가 에러를 캐치하고{" "}
                <code>throwOnError: true</code> 이므로 다음 렌더에서 re-throw
              </li>
              <li>React Error Boundary 가 에러를 캐치</li>
              <li>
                같은 폴더의 <code>error.tsx</code> 가 렌더링됨
              </li>
              <li>
                error.tsx 의 <code>reset()</code> 호출 시 페이지 전체가
                재렌더링되어 복구
              </li>
            </ol>
          </div>

          {!showFatalDemo ? (
            <button
              type="button"
              onClick={() => setShowFatalDemo(true)}
              className="mt-3 rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
            >
              치명적 에러 발생 → error.tsx 로 이동
            </button>
          ) : (
            <FatalQueryDemo />
          )}
        </section>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────
// error.tsx 전파 데모 컴포넌트
// QueryClient defaultOptions 의 throwOnError: true 덕분에
// 이 컴포넌트에서 별도 설정 없이도 에러가 error.tsx 로 전파됩니다.
// ──────────────────────────────────────────────
function FatalQueryDemo() {
  useQuery({
    queryKey: ["p00018-fatal-demo"],
    queryFn: () => getFatalDataAction(),
    retry: false, // 재시도 없이 즉시 에러 처리
    // throwOnError 별도 설정 불필요 → defaultOptions 에서 전역으로 설정됨
  });

  return (
    <p className="mt-3 text-sm text-rose-700 animate-pulse">
      서버에서 데이터를 가져오는 중... (곧 에러가 발생합니다)
    </p>
  );
}
