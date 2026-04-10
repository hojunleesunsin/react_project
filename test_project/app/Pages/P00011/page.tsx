"use client";

import { useState } from "react";
import { Search } from "@/components/common/Search";
import { DataGrid, type DataGridColumn } from "@/components/common/DataGrid";
import { BarChartCard } from "@/components/common/BarChartCard";
import {
  fetchEmployeesAction,
  fetchTeamChartAction,
  type EmployeeRow,
  type TeamChartRow,
} from "./actions";

const columns: DataGridColumn<EmployeeRow>[] = [
  { key: "id", header: "사번", align: "right" },
  { key: "name", header: "이름" },
  { key: "team", header: "팀" },
  { key: "grade", header: "직급" },
  {
    key: "status",
    header: "상태",
    align: "center",
    render: (value) => (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
          value === "재직"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {String(value)}
      </span>
    ),
  },
];

export default function Page() {
  const [team, setTeam] = useState("all");
  const [grade, setGrade] = useState("all");
  const [status, setStatus] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [rowsPromise, setRowsPromise] = useState<Promise<EmployeeRow[]> | null>(null);
  const [chartPromise, setChartPromise] = useState<Promise<TeamChartRow[]> | null>(null);
  const [submittedFilters, setSubmittedFilters] = useState({
    team: "all",
    grade: "all",
    status: "all",
  });

  const searchFields = [
    {
      key: "team",
      label: "부서",
      value: team,
      options: [
        { value: "all", label: "전체" },
        { value: "미지정", label: "미지정" },
        { value: "Frontend", label: "Frontend" },
        { value: "Backend", label: "Backend" },
        { value: "Data", label: "Data" },
      ],
    },
    {
      key: "grade",
      label: "직급",
      value: grade,
      options: [
        { value: "all", label: "전체" },
        { value: "미지정", label: "미지정" },
        { value: "Junior", label: "Junior" },
        { value: "Mid", label: "Mid" },
        { value: "Senior", label: "Senior" },
      ],
    },
    {
      key: "status",
      label: "상태",
      value: status,
      options: [
        { value: "all", label: "전체" },
        { value: "재직", label: "재직" },
        { value: "휴직", label: "휴직" },
      ],
    },
  ];

  const onChangeField = (key: string, value: string) => {
    if (key === "team") setTeam(value);
    if (key === "grade") setGrade(value);
    if (key === "status") setStatus(value);
  };

  const onReset = () => {
    setTeam("all");
    setGrade("all");
    setStatus("all");
    setHasSearched(false);
    setIsSearching(false);
    setRowsPromise(null);
    setChartPromise(null);
    setSubmittedFilters({ team: "all", grade: "all", status: "all" });
  };

  const onSearch = () => {
    const nextFilters = { team, grade, status };
    setSubmittedFilters(nextFilters);
    setHasSearched(true);
    setIsSearching(true);

    const nextRowsPromise = fetchEmployeesAction(nextFilters);
    const nextChartPromise = fetchTeamChartAction(nextFilters);

    setRowsPromise(nextRowsPromise);
    setChartPromise(nextChartPromise);

    void Promise.allSettled([nextRowsPromise, nextChartPromise]).finally(() => {
      setIsSearching(false);
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">P00011 - 공용 Select + 공용 DataGrid</h1>
          <p className="mt-1 text-sm text-slate-600">
            좌측 공용 필터 컨트롤과 우측 공용 데이터 그리드 조합 예제입니다.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Search
            title="조회조건"
            fields={searchFields}
            onChangeField={onChangeField}
            onSearch={onSearch}
            isSearching={isSearching}
            onReset={onReset}
          />

          <div className="grid gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">조회 조건</h2>
                <span className="text-sm text-slate-500">
                  {hasSearched
                    ? `팀 ${submittedFilters.team} / 직급 ${submittedFilters.grade} / 상태 ${submittedFilters.status}`
                    : "조회 전"}
                </span>
              </div>
              {!hasSearched ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  좌측 필터를 선택한 뒤 <strong>조회</strong> 버튼을 눌러주세요.
                </div>
              ) : null}
            </div>

            {hasSearched ? (
              <>
                <BarChartCard
                  title="부서별 인원"
                  dataPromise={chartPromise ?? Promise.resolve([])}
                  emptyMessage="차트 데이터가 없습니다."
                />
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-3 text-base font-semibold">직원 목록</h2>
                  <DataGrid
                    columns={columns}
                    rowKey={(row) => String(row.id)}
                    rowsPromise={rowsPromise ?? Promise.resolve([])}
                    emptyMessage="조건에 맞는 데이터가 없습니다."
                  />
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
