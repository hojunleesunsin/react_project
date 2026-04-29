import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    // Refresh Token이 만료된 경우 로그인 페이지로 강제 리다이렉트
    if (req.nextauth.token?.error === "RefreshTokenExpired") {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("reason", "session_expired");
      return NextResponse.redirect(loginUrl);
    }
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      // 토큰이 없거나, 만료 에러가 있거나, 구형 토큰(accessTokenExpires 없음)이면 인증 실패
      authorized: ({ token }) =>
        !!token &&
        !!token.accessTokenExpires &&
        token.error !== "RefreshTokenExpired",
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
