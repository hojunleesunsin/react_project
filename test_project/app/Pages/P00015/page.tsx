"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";

type Team = "Frontend" | "Backend" | "Data";
type Status = "active" | "inactive";
type SortBy = "name" | "score";

type Member = {
  id: number;
  name: string;
  team: Team;
  status: Status;
  score: number;
};

type Query = {
  keyword: string;
  team: "all" | Team;
  status: "all" | Status;
  sortBy: SortBy;
  page: number;
  pageSize: number;
};

type State = {
  query: Query;
  isLoading: boolean;
  error: string | null;
  rows: Member[];
  totalCount: number;
  selectedIds: number[];
  requestId: number;
  lastLoadedAt: string | null;
};

type Action =
  | { type: "query/keyword"; payload: string }
  | { type: "query/team"; payload: Query["team"] }
  | { type: "query/status"; payload: Query["status"] }
  | { type: "query/sort"; payload: SortBy }
  | { type: "query/page"; payload: number }
  | { type: "query/pageSize"; payload: number }
  | { type: "query/reset" }
  | { type: "selection/toggle"; payload: number }
  | { type: "selection/clear" }
  | { type: "fetch/start"; requestId: number }
  | { type: "fetch/success"; requestId: number; payload: { rows: Member[]; totalCount: number; loadedAt: string } }
  | { type: "fetch/error"; requestId: number; error: string };

const INITIAL_QUERY: Query = {
  keyword: "",
  team: "all",
  status: "all",
  sortBy: "name",
  page: 1,
  pageSize: 10,
};

const INITIAL_STATE: State = {
  query: INITIAL_QUERY,
  isLoading: false,
  error: null,
  rows: [],
  totalCount: 0,
  selectedIds: [],
  requestId: 0,
  lastLoadedAt: null,
};

const SOURCE: Member[] = Array.from({ length: 220 }).map((_, idx) => {
  const n = idx + 1;
  return {
    id: n,
    name: `Member-${n}`,
    team: n % 3 === 0 ? "Data" : n % 3 === 1 ? "Frontend" : "Backend",
    status: n % 4 === 0 ? "inactive" : "active",
    score: (n * 31) % 100,
  };
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "query/keyword":
      return {
        ...state,
        query: { ...state.query, keyword: action.payload, page: 1 },
        selectedIds: [],
      };
    case "query/team":
      return {
        ...state,
        query: { ...state.query, team: action.payload, page: 1 },
        selectedIds: [],
      };
    case "query/status":
      return {
        ...state,
        query: { ...state.query, status: action.payload, page: 1 },
        selectedIds: [],
      };
    case "query/sort":
      return {
        ...state,
        query: { ...state.query, sortBy: action.payload, page: 1 },
      };
    case "query/page":
      return {
        ...state,
        query: { ...state.query, page: action.payload },
      };
    case "query/pageSize":
      return {
        ...state,
        query: { ...state.query, pageSize: action.payload, page: 1 },
        selectedIds: [],
      };
    case "query/reset":
      return {
        ...state,
        query: INITIAL_QUERY,
        selectedIds: [],
        error: null,
      };
    case "selection/toggle":
      return state.selectedIds.includes(action.payload)
        ? { ...state, selectedIds: state.selectedIds.filter((id) => id !== action.payload) }
        : { ...state, selectedIds: [...state.selectedIds, action.payload] };
    case "selection/clear":
      return { ...state, selectedIds: [] };
    case "fetch/start":
      return {
        ...state,
        isLoading: true,
        error: null,
        requestId: action.requestId,
      };
    case "fetch/success":
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        isLoading: false,
        error: null,
        rows: action.payload.rows,
        totalCount: action.payload.totalCount,
        lastLoadedAt: action.payload.loadedAt,
        selectedIds: state.selectedIds.filter((id) => action.payload.rows.some((row) => row.id === id)),
      };
    case "fetch/error":
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

async function fakeFetchMembers(query: Query) {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 600));

  const keyword = query.keyword.trim().toLowerCase();
  let filtered = SOURCE.filter((row) => {
    const keywordMatch = !keyword || row.name.toLowerCase().includes(keyword);
    const teamMatch = query.team === "all" || row.team === query.team;
    const statusMatch = query.status === "all" || row.status === query.status;
    return keywordMatch && teamMatch && statusMatch;
  });

  if (query.sortBy === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered = [...filtered].sort((a, b) => b.score - a.score);
  }

  const totalCount = filtered.length;
  const start = (query.page - 1) * query.pageSize;
  const rows = filtered.slice(start, start + query.pageSize);

  return {
    rows,
    totalCount,
    loadedAt: new Date().toLocaleTimeString(),
  };
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const requestId = requestSeqRef.current + 1;
    requestSeqRef.current = requestId;

    dispatch({ type: "fetch/start", requestId });

    fakeFetchMembers(state.query)
      .then((result) => {
        dispatch({ type: "fetch/success", requestId, payload: result });
      })
      .catch(() => {
        dispatch({
          type: "fetch/error",
          requestId,
          error: "데이터 조회 중 오류가 발생했습니다.",
        });
      });
  }, [state.query]);

  const totalPages = useMemo(() => {
    if (!state.totalCount) return 1;
    return Math.ceil(state.totalCount / state.query.pageSize);
  }, [state.totalCount, state.query.pageSize]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">P00015 - useReducer 복합 상태 관리 예제</h1>
          <p className="mt-1 text-sm text-slate-600">
            필터, 정렬, 페이지, 선택, 로딩, 에러, 요청 경합 처리까지 하나의 reducer로 관리합니다.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="grid gap-1 text-sm font-semibold">
              키워드
              <input
                value={state.query.keyword}
                onChange={(e) => dispatch({ type: "query/keyword", payload: e.target.value })}
                placeholder="Member-10"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold">
              팀
              <select
                value={state.query.team}
                onChange={(e) => dispatch({ type: "query/team", payload: e.target.value as Query["team"] })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              >
                <option value="all">전체</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Data">Data</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-semibold">
              상태
              <select
                value={state.query.status}
                onChange={(e) => dispatch({ type: "query/status", payload: e.target.value as Query["status"] })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              >
                <option value="all">전체</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-semibold">
              정렬
              <select
                value={state.query.sortBy}
                onChange={(e) => dispatch({ type: "query/sort", payload: e.target.value as SortBy })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              >
                <option value="name">이름순</option>
                <option value="score">점수순</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-semibold">
              페이지 크기
              <select
                value={state.query.pageSize}
                onChange={(e) => dispatch({ type: "query/pageSize", payload: Number(e.target.value) })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: "query/reset" })}
                className="rounded-md bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
              >
                필터 초기화
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "selection/clear" })}
                className="rounded-md bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
              >
                선택 초기화
              </button>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <p>로딩: {state.isLoading ? "조회 중..." : "대기"}</p>
              <p>요청 ID: {state.requestId}</p>
              <p>총 건수: {state.totalCount.toLocaleString()}</p>
              <p>선택 건수: {state.selectedIds.length}</p>
              <p>마지막 조회: {state.lastLoadedAt ?? "-"}</p>
              {state.error ? <p className="mt-1 text-rose-700">에러: {state.error}</p> : null}
            </div>
          </aside>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">조회 결과</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-2 py-2 text-left">선택</th>
                    <th className="px-2 py-2 text-left">이름</th>
                    <th className="px-2 py-2 text-left">팀</th>
                    <th className="px-2 py-2 text-left">상태</th>
                    <th className="px-2 py-2 text-right">점수</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rows.length ? (
                    state.rows.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={state.selectedIds.includes(row.id)}
                            onChange={() => dispatch({ type: "selection/toggle", payload: row.id })}
                          />
                        </td>
                        <td className="px-2 py-2">{row.name}</td>
                        <td className="px-2 py-2">{row.team}</td>
                        <td className="px-2 py-2">{row.status}</td>
                        <td className="px-2 py-2 text-right">{row.score}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2 py-8 text-center text-slate-500">
                        {state.isLoading ? "조회 중..." : "조건에 맞는 데이터가 없습니다."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm">
              <p>
                페이지 {state.query.page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "query/page", payload: Math.max(1, state.query.page - 1) })}
                  disabled={state.query.page <= 1}
                  className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "query/page", payload: Math.min(totalPages, state.query.page + 1) })
                  }
                  disabled={state.query.page >= totalPages}
                  className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
