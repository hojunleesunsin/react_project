import { unstable_cache } from "next/cache";
import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";

type PermCheckBody = {
  userId: string;
  appId: string;
  permCode?: string;
};

type PermCheckRow = {
  DEFAULT_PERM: string;
  HAS_PERM: "Y" | "N";
};

/**
 * 내부 권한 체크 API — proxy.ts (Edge)에서만 호출
 *
 * - INTERNAL_SECRET 헤더로 외부 직접 호출 차단
 * - APP_MENU + USER_APP_PERMISSION 조인 단일 쿼리로 처리
 * - unstable_cache로 30분 캐싱 (DB는 최초 1회만 접근)
 *
 * proxy.ts matcher에서 api/internal 제외 필수
 */
export async function POST(req: Request) {
  const secret = req.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, appId, permCode } = (await req.json()) as PermCheckBody;

  if (!userId || !appId) {
    return Response.json({ error: "userId, appId는 필수입니다." }, { status: 400 });
  }

  const result = await checkAccess(userId, appId, permCode);

  if (!result) {
    // APP_MENU에 appId 없음
    return Response.json({ allowed: false, permCode: null });
  }

  return Response.json({ allowed: result.allowed, permCode: result.permCode });
}

/**
 * APP_MENU + USER_APP_PERMISSION 조인으로 단일 쿼리 처리
 *
 * - permCode가 있으면 해당 권한으로 체크
 * - permCode가 없으면 APP_MENU.DEFAULT_PERM을 사용
 * - LEFT JOIN으로 앱 존재 여부(null)와 권한 여부(HAS_PERM)를 한번에 판별
 *
 * SQL:
 *   SELECT m.DEFAULT_PERM,
 *          CASE WHEN p.USER_ID IS NOT NULL THEN 'Y' ELSE 'N' END AS HAS_PERM
 *   FROM APP_MENU m
 *   LEFT JOIN USER_APP_PERMISSION p
 *     ON  p.APP_ID    = m.APP_ID
 *     AND p.USER_ID   = :userId
 *     AND p.PERM_CODE = COALESCE(:permCode, m.DEFAULT_PERM)
 *   WHERE m.APP_ID = :appId
 *     AND ROWNUM   = 1
 */
function checkAccess(
  userId: string,
  appId: string,
  permCode: string | undefined,
): Promise<{ allowed: boolean; permCode: string } | null> {
  return unstable_cache(
    async () => {
      const conn = await getOracleConnection();
      try {
        const result = await conn.execute<PermCheckRow>(
          `SELECT m.DEFAULT_PERM,
                  CASE WHEN p.USER_ID IS NOT NULL THEN 'Y' ELSE 'N' END AS HAS_PERM
           FROM APP_MENU m
           LEFT JOIN USER_APP_PERMISSION p
             ON  p.APP_ID    = m.APP_ID
             AND p.USER_ID   = :userId
             AND p.PERM_CODE = COALESCE(:permCode, m.DEFAULT_PERM)
           WHERE m.APP_ID = :appId
             AND ROWNUM   = 1`,
          { userId, appId, permCode: permCode ?? null },
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );

        const row = result.rows?.[0];
        if (!row) return null; // appId가 APP_MENU에 없음

        return {
          allowed: row.HAS_PERM === "Y",
          permCode: permCode ?? row.DEFAULT_PERM,
        };
      } finally {
        await conn.close();
      }
    },
    [`perm-${userId}-${appId}-${permCode ?? "default"}`],
    { revalidate: 1800 }, // 30분
  )();
}
