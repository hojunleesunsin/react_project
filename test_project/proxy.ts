import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 로그인 페이지만 공개 경로 — 그 외 모든 경로는 토큰 필수
const PUBLIC_PAGE = "/login";

/**
 * proxy — 모든 요청이 애플리케이션에 도달하기 전에 실행되는 Edge 함수
 *
 * 역할:
 * 1. JWT 토큰 유무로 인증 상태 판단 (DB 조회 없이 쿠키만 확인)
 * 2. 미인증 요청 차단 (페이지 → 로그인 리다이렉트, API → 401 반환)
 * 3. 인증된 요청에 사용자 정보 헤더 주입 (백엔드 서버에서 활용 가능)
 *
 * 실행 환경: Edge Runtime (Node.js API 사용 불가 — oracledb 등 import 금지)
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * JWT 토큰 추출
   * - 브라우저 쿠키(next-auth.session-token)를 복호화해서 페이로드 반환
   * - 토큰이 없거나 만료됐으면 null 반환
   * - DB 조회 없이 쿠키만 확인하므로 빠름
   */
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── 미인증 요청 처리 ──────────────────────────────────────────
  if (!token) {
    // 로그인 페이지는 토큰 없이 접근 허용
    if (pathname.startsWith(PUBLIC_PAGE)) {
      return NextResponse.next();
    }
    // API 요청: 401 반환 (클라이언트에서 try/catch로 핸들링)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 그 외 모든 페이지: 로그인으로 리다이렉트, 복귀 경로를 쿼리로 전달
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = PUBLIC_PAGE;
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 인증된 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트 ──
  if (pathname.startsWith(PUBLIC_PAGE)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /**
   * 인증된 요청에 사용자 정보 헤더 주입
   * - 백엔드 API 서버에서 별도 JWT 검증 없이 헤더만 읽으면 요청자 식별 가능
   * - 단, 백엔드가 이 헤더를 신뢰하려면 Next.js를 통해서만 접근 가능해야 함
   */
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", token.sub ?? "");
  requestHeaders.set("x-user-login-id", (token.loginId as string | undefined) ?? "");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * 인터셉트 제외 경로 (proxy 함수가 실행되지 않는 경로):
     * - api/auth     : NextAuth 인증 라우트 — 로그인 처리 자체이므로 제외
     * - _next/static : JS·CSS 등 정적 번들 파일
     * - _next/image  : Next.js 이미지 최적화 API
     * - favicon.ico  : 파비콘
     */
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
