import { NextResponse } from "next/server";
import { testOracleConnection } from "@/lib/oracle";

export async function GET() {
  try {
    const rows = await testOracleConnection();
    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Oracle error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
