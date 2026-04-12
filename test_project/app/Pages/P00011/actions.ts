"use server";

import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";

export type EmployeeRow = {
  id: number;
  name: string;
  team: string;
  grade: string;
  status: "재직" | "휴직";
};

export type EmployeeFilters = {
  team: string;
  grade: string;
  status: string;
};

export type TeamChartRow = {
  label: string;
  value: number;
};

/** DB 미연결 테스트용 — export 하면 안 됨(`"use server"` 파일은 async 액션만 export 가능). */
const DUMMY_EMPLOYEES: EmployeeRow[] = [
  { id: 1001, name: "김더미", team: "Frontend", grade: "Senior", status: "재직" },
  { id: 1002, name: "이샘플", team: "Frontend", grade: "Mid", status: "재직" },
  { id: 1003, name: "박테스트", team: "Backend", grade: "Junior", status: "재직" },
  { id: 1004, name: "최모킹", team: "Backend", grade: "Senior", status: "휴직" },
  { id: 1005, name: "정로컬", team: "Data", grade: "Mid", status: "재직" },
  { id: 1006, name: "한스텁", team: "미지정", grade: "미지정", status: "재직" },
];

function filterDummyEmployees(filters: EmployeeFilters): EmployeeRow[] {
  return DUMMY_EMPLOYEES.filter((row) => {
    const teamOk = filters.team === "all" || row.team === filters.team;
    const gradeOk = filters.grade === "all" || row.grade === filters.grade;
    const statusOk = filters.status === "all" || row.status === filters.status;
    return teamOk && gradeOk && statusOk;
  }).sort((a, b) => b.id - a.id);
}
function buildDummyTeamChart(filters: EmployeeFilters): TeamChartRow[] {
  const filtered = filterDummyEmployees(filters);
  const counts = new Map<string, number>();
  for (const row of filtered) {
    counts.set(row.team, (counts.get(row.team) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label, "ko"));
}

export async function fetchEmployeesAction(
  filters: EmployeeFilters,
): Promise<EmployeeRow[]> {
  // --- DB 미연결: 아래 한 줄 주석 해제 후, `const connection` ~ `finally` 블록 전체 주석 처리 ---
  // return filterDummyEmployees(filters);
  // -------------------------------------------------------------------------------------------

  const connection = await getOracleConnection();

  try {
    const result = await connection.execute(
      `SELECT
        EMPLOYEE_ID,
        FULL_NAME,
        NVL(DEPARTMENT_NAME, '미지정') AS TEAM,
        NVL(POSITION_TITLE, '미지정') AS GRADE,
        CASE WHEN IS_ACTIVE = 'Y' THEN '재직' ELSE '휴직' END AS STATUS
      FROM MST_EMPLOYEE
      WHERE (:team = 'all' OR DEPARTMENT_NAME = :team)
        AND (:grade = 'all' OR POSITION_TITLE = :grade)
        AND (
          :status = 'all'
          OR (:status = '재직' AND IS_ACTIVE = 'Y')
          OR (:status = '휴직' AND IS_ACTIVE = 'N')
        )
      ORDER BY EMPLOYEE_ID DESC`,
      {
        team: filters.team,
        grade: filters.grade,
        status: filters.status,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = (result.rows ?? []) as Array<{
      EMPLOYEE_ID: number;
      FULL_NAME: string;
      TEAM: string;
      GRADE: string;
      STATUS: "재직" | "휴직";
    }>;

    return rows.map((row) => ({
      id: row.EMPLOYEE_ID,
      name: row.FULL_NAME,
      team: row.TEAM,
      grade: row.GRADE,
      status: row.STATUS,
    }));
  } finally {
    await connection.close();
  }
}

export async function fetchTeamChartAction(
  filters: EmployeeFilters,
): Promise<TeamChartRow[]> {
  // --- DB 미연결: 아래 한 줄 주석 해제 후, `const connection` ~ `finally` 블록 전체 주석 처리 ---
  // return buildDummyTeamChart(filters);
  // -------------------------------------------------------------------------------------------

  const connection = await getOracleConnection();

  try {
    const result = await connection.execute(
      `SELECT
        NVL(DEPARTMENT_NAME, '미지정') AS LABEL,
        COUNT(*) AS VALUE
      FROM MST_EMPLOYEE
      WHERE (:team = 'all' OR DEPARTMENT_NAME = :team)
        AND (:grade = 'all' OR POSITION_TITLE = :grade)
        AND (
          :status = 'all'
          OR (:status = '재직' AND IS_ACTIVE = 'Y')
          OR (:status = '휴직' AND IS_ACTIVE = 'N')
        )
      GROUP BY NVL(DEPARTMENT_NAME, '미지정')
      ORDER BY LABEL`,
      {
        team: filters.team,
        grade: filters.grade,
        status: filters.status,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = (result.rows ?? []) as Array<{
      LABEL: string;
      VALUE: number;
    }>;

    return rows.map((row) => ({
      label: row.LABEL,
      value: Number(row.VALUE),
    }));
  } finally {
    await connection.close();
  }
}
