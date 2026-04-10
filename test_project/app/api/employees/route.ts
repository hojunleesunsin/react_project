import { NextResponse } from "next/server";
import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";
import { hashPassword } from "@/lib/password";

type CreateEmployeePayload = {
  loginId?: string;
  email?: string;
  fullName?: string;
  password?: string;
  phoneNumber?: string;
  departmentName?: string;
  positionTitle?: string;
  hireDate?: string;
  isActive?: "Y" | "N";
};

export async function GET() {
  const connection = await getOracleConnection();

  try {
    const result = await connection.execute(
      `SELECT
        EMPLOYEE_ID,
        LOGIN_ID,
        EMAIL,
        FULL_NAME,
        PHONE_NUMBER,
        DEPARTMENT_NAME,
        POSITION_TITLE,
        HIRE_DATE,
        IS_ACTIVE,
        CREATED_AT,
        UPDATED_AT
      FROM MST_EMPLOYEE
      ORDER BY EMPLOYEE_ID DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return NextResponse.json({ ok: true, rows: result.rows ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch employees";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  } finally {
    await connection.close();
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreateEmployeePayload;

  if (!body.loginId || !body.email || !body.fullName || !body.password) {
    return NextResponse.json(
      {
        ok: false,
        message: "loginId, email, fullName, password are required",
      },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(body.password);
  const connection = await getOracleConnection();

  try {
    const result = await connection.execute(
      `INSERT INTO MST_EMPLOYEE (
        LOGIN_ID,
        EMAIL,
        FULL_NAME,
        PASSWORD_HASH,
        PHONE_NUMBER,
        DEPARTMENT_NAME,
        POSITION_TITLE,
        HIRE_DATE,
        IS_ACTIVE
      ) VALUES (
        :loginId,
        :email,
        :fullName,
        :passwordHash,
        :phoneNumber,
        :departmentName,
        :positionTitle,
        CASE WHEN :hireDate IS NULL THEN NULL ELSE TO_DATE(:hireDate, 'YYYY-MM-DD') END,
        :isActive
      )`,
      {
        loginId: body.loginId,
        email: body.email,
        fullName: body.fullName,
        passwordHash,
        phoneNumber: body.phoneNumber ?? null,
        departmentName: body.departmentName ?? null,
        positionTitle: body.positionTitle ?? null,
        hireDate: body.hireDate ?? null,
        isActive: body.isActive ?? "Y",
      },
      { autoCommit: true },
    );

    return NextResponse.json({
      ok: true,
      affectedRows: result.rowsAffected ?? 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create employee";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  } finally {
    await connection.close();
  }
}
