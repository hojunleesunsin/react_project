import { NextResponse } from "next/server";
import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";
import { hashPassword } from "@/lib/password";

type UpdateEmployeePayload = {
  email?: string;
  fullName?: string;
  password?: string;
  phoneNumber?: string;
  departmentName?: string;
  positionTitle?: string;
  hireDate?: string | null;
  isActive?: "Y" | "N";
};

function parseEmployeeId(rawId: string) {
  const id = Number(rawId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const { employeeId } = await params;
  const id = parseEmployeeId(employeeId);
  if (!id) {
    return NextResponse.json({ ok: false, message: "Invalid employeeId" }, { status: 400 });
  }

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
      WHERE EMPLOYEE_ID = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const row = result.rows?.[0] ?? null;
    if (!row) {
      return NextResponse.json({ ok: false, message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, row });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch employee";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  } finally {
    await connection.close();
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const { employeeId } = await params;
  const id = parseEmployeeId(employeeId);
  if (!id) {
    return NextResponse.json({ ok: false, message: "Invalid employeeId" }, { status: 400 });
  }

  const body = (await req.json()) as UpdateEmployeePayload;
  const passwordHash = body.password ? await hashPassword(body.password) : null;
  const connection = await getOracleConnection();

  try {
    const result = await connection.execute(
      `UPDATE MST_EMPLOYEE
       SET
         EMAIL = NVL(:email, EMAIL),
         FULL_NAME = NVL(:fullName, FULL_NAME),
         PASSWORD_HASH = NVL(:passwordHash, PASSWORD_HASH),
         PHONE_NUMBER = :phoneNumber,
         DEPARTMENT_NAME = :departmentName,
         POSITION_TITLE = :positionTitle,
         HIRE_DATE = CASE
           WHEN :hireDate IS NULL THEN HIRE_DATE
           WHEN :hireDate = 'NULL' THEN NULL
           ELSE TO_DATE(:hireDate, 'YYYY-MM-DD')
         END,
         IS_ACTIVE = NVL(:isActive, IS_ACTIVE),
         UPDATED_AT = SYSTIMESTAMP
       WHERE EMPLOYEE_ID = :id`,
      {
        id,
        email: body.email ?? null,
        fullName: body.fullName ?? null,
        passwordHash,
        phoneNumber: body.phoneNumber ?? null,
        departmentName: body.departmentName ?? null,
        positionTitle: body.positionTitle ?? null,
        hireDate: body.hireDate === null ? "NULL" : (body.hireDate ?? null),
        isActive: body.isActive ?? null,
      },
      { autoCommit: true },
    );

    if (!result.rowsAffected) {
      return NextResponse.json({ ok: false, message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, affectedRows: result.rowsAffected });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update employee";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  } finally {
    await connection.close();
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const { employeeId } = await params;
  const id = parseEmployeeId(employeeId);
  if (!id) {
    return NextResponse.json({ ok: false, message: "Invalid employeeId" }, { status: 400 });
  }

  const connection = await getOracleConnection();
  try {
    const result = await connection.execute(
      `DELETE FROM MST_EMPLOYEE WHERE EMPLOYEE_ID = :id`,
      { id },
      { autoCommit: true },
    );

    if (!result.rowsAffected) {
      return NextResponse.json({ ok: false, message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, affectedRows: result.rowsAffected });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete employee";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  } finally {
    await connection.close();
  }
}
