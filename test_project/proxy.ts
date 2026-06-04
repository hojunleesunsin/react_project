import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 로그인 페이지만 공개 경로 — 그 외 모든 경로는 토큰 필수
const PUBLIC_PAGE = "/login";

// 앱 라우트 prefix — 이 경로에 대해서만 권한 체크 수행
// URL 형식: /api/apps/{appId}?perm=SESS  (permCode는 쿼리 파라미터)
const APP_ROUTE_PREFIX = "/api/apps/";

/**
 * proxy — 모든 요청이 애플리케이션에 도달하기 전에 실행되는 Edge 함수
 *
 * 역할:
 * 1. JWT 토큰 유무로 인증 상태 판단 (DB 조회 없이 쿠키만 확인)
 * 2. 미인증 요청 차단 (페이지 → 로그인 리다이렉트, API → 401 반환)
 * 3. 앱 라우트(/api/apps/*)에 대해 내부 권한 API 호출 후 결과를 헤더로 주입
 * 4. 인증된 요청에 사용자 정보 헤더 주입
 *
 * 실행 환경: Edge Runtime (Node.js API 사용 불가 — oracledb 등 import 금지)
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * JWT 토큰 추출
   * - 브라우저 쿠키(next-auth.session-token)를 복호화해서 페이로드 반환
   * - 토큰이 없거나 만료됐으면 null 반환
   */
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── 미인증 요청 처리 ──────────────────────────────────────────
  if (!token) {
    if (pathname.startsWith(PUBLIC_PAGE)) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = PUBLIC_PAGE;
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 인증된 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트 ──
  if (pathname.startsWith(PUBLIC_PAGE)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── 공통 사용자 정보 헤더 ──────────────────────────────────────
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", token.sub ?? "");
  requestHeaders.set("x-user-login-id", (token.loginId as string | undefined) ?? "");

  // ── 앱 라우트 권한 체크 (/api/apps/{appId}?perm=SESS) ──
  if (pathname.startsWith(APP_ROUTE_PREFIX)) {
    const appId = pathname.slice(APP_ROUTE_PREFIX.length);          // A00001
    const permCode = req.nextUrl.searchParams.get("perm") ?? undefined; // ?perm=SESS

    const permResult = await checkPermission(req, token.sub ?? "", appId, permCode);

    if (!permResult.allowed) {
      const message = permResult.permCode
        ? `'${appId}' 접근 권한(${permResult.permCode})이 없습니다.`
        : `앱 '${appId}'이(가) 등록되지 않았습니다.`;
      return NextResponse.json({ error: message }, { status: 403 });
    }

    // 권한 통과 — 헤더로 결과 주입
    requestHeaders.set("x-perm-allowed", "true");
    requestHeaders.set("x-app-id", appId);
    requestHeaders.set("x-perm-code", permResult.permCode ?? "");
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

/**
 * 내부 권한 체크 API 호출
 * - /api/internal/perm-check 는 matcher에서 제외되어 proxy를 통하지 않음
 * - resolveAndCheck 내부의 unstable_cache로 30분간 캐싱 → DB는 최초 1회만 접근
 */
async function checkPermission(
  req: NextRequest,
  userId: string,
  appId: string,
  permCode: string | undefined,
): Promise<{ allowed: boolean; permCode: string | null }> {
  try {
    const res = await fetch(
      `${req.nextUrl.origin}/api/internal/perm-check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
        },
        body: JSON.stringify({ userId, appId, permCode }),
      },
    );

    if (!res.ok) return { allowed: false, permCode: null };

    return (await res.json()) as { allowed: boolean; permCode: string | null };
  } catch {
    // 내부 API 호출 실패 시 안전하게 차단
    return { allowed: false, permCode: null };
  }
}

export const config = {
  matcher: [
    /*
     * 인터셉트 제외 경로 (proxy 함수가 실행되지 않는 경로):
     * - api/auth     : NextAuth 인증 라우트
     * - api/internal : 내부 전용 API (proxy → perm-check 무한루프 방지)
     * - _next/static : JS·CSS 등 정적 번들 파일
     * - _next/image  : Next.js 이미지 최적화 API
     * - favicon.ico  : 파비콘
     */
    "/((?!api/auth|api/internal|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
