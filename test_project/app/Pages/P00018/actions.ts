"use server";

import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";

export type Employee = {
  employeeId: number;
  loginId: string;
  fullName: string;
  isActive: "Y" | "N";
};

type EmployeeRow = {
  EMPLOYEE_ID: number;
  LOGIN_ID: string;
  FULL_NAME: string;
  IS_ACTIVE: "Y" | "N";
};

// 직원 목록 조회
export async function getEmployeesAction(keyword: string): Promise<Employee[]> {
  const connection = await getOracleConnection();
  try {
    const trimmed = keyword.trim();
    const hasKeyword = trimmed.length > 0;

    const sql = `
      SELECT EMPLOYEE_ID, LOGIN_ID, FULL_NAME, IS_ACTIVE
      FROM MST_EMPLOYEE
      ${hasKeyword ? "WHERE UPPER(FULL_NAME) LIKE UPPER(:keyword)" : ""}
      ORDER BY EMPLOYEE_ID
    `;
    const binds = hasKeyword ? { keyword: `%${trimmed}%` } : [];

    const result = await connection.execute<EmployeeRow>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return (result.rows ?? []).map((row) => ({
      employeeId: row.EMPLOYEE_ID,
      loginId: row.LOGIN_ID,
      fullName: row.FULL_NAME,
      isActive: row.IS_ACTIVE,
    }));
  } finally {
    await connection.close();
  }
}

// 직원 활성 상태 토글 (Y → N, N → Y)
export async function toggleEmployeeStatusAction(
  employeeId: number,
  currentStatus: "Y" | "N",
): Promise<void> {
  const connection = await getOracleConnection();
  try {
    await connection.execute(
      `UPDATE MST_EMPLOYEE SET IS_ACTIVE = :newStatus WHERE EMPLOYEE_ID = :id`,
      { newStatus: currentStatus === "Y" ? "N" : "Y", id: employeeId },
    );
    await connection.commit();
  } finally {
    await connection.close();
  }
}

// 치명적 에러 시뮬레이션 (error.tsx 전파 데모용)
// throwOnError: true 와 함께 사용하면 error.tsx 로 에러가 전파됩니다
export async function getFatalDataAction(): Promise<never> {
  await new Promise((r) => setTimeout(r, 600));
  throw new Error(
    "치명적 서버 오류: 필수 설정 데이터를 불러올 수 없습니다. (시뮬레이션)",
  );
}
