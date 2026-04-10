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

export async function fetchEmployeesAction(
  filters: EmployeeFilters,
): Promise<EmployeeRow[]> {
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
