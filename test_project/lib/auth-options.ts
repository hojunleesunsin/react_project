import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";
import { verifyPassword } from "@/lib/password";

type EmployeeRow = {
  EMPLOYEE_ID: number;
  LOGIN_ID: string;
  FULL_NAME: string;
  PASSWORD_HASH: string;
  IS_ACTIVE: "Y" | "N";
};

// Access Token: 15분, Refresh Token: 8시간 (업무 시간 기준)
const ACCESS_TOKEN_TTL  = 15 * 60;       // 15분 (초)
const REFRESH_TOKEN_TTL = 8 * 60 * 60;   // 8시간 (초)

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: REFRESH_TOKEN_TTL,      // JWT 쿠키 최대 유효 기간 (8시간)
    updateAge: ACCESS_TOKEN_TTL,    // 15분마다 세션 갱신 시도
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const loginId = credentials?.loginId?.trim();
        const password = credentials?.password;
        if (!loginId || !password) {
          return null;
        }

        try {
          const connection = await getOracleConnection();
          try {
            const result = await connection.execute(
              `SELECT
                EMPLOYEE_ID,
                LOGIN_ID,
                FULL_NAME,
                PASSWORD_HASH,
                IS_ACTIVE
               FROM MST_EMPLOYEE
               WHERE UPPER(LOGIN_ID) = UPPER(:loginId)`,
              { loginId },
              { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );

            const employee = (result.rows?.[0] ?? null) as EmployeeRow | null;
            if (!employee || employee.IS_ACTIVE !== "Y") {
              return null;
            }

            const matched = await verifyPassword(password, employee.PASSWORD_HASH);
            if (!matched) {
              return null;
            }

            return {
              id: String(employee.EMPLOYEE_ID),
              loginId: employee.LOGIN_ID,
              name: employee.FULL_NAME,
            };
          } finally {
            await connection.close();
          }
        } catch (error) {
          console.error("Credentials authorize failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const nowSec = Math.floor(Date.now() / 1000);

      // 최초 로그인 시: 사용자 정보와 만료 시간 토큰에 저장
      if (user) {
        return {
          ...token,
          loginId: (user as { loginId?: string }).loginId,
          accessTokenExpires: nowSec + ACCESS_TOKEN_TTL,
          refreshTokenExpires: nowSec + REFRESH_TOKEN_TTL,
        };
      }

      // Access Token이 아직 유효한 경우: 그대로 반환
      if (nowSec < (token.accessTokenExpires ?? 0)) {
        return token;
      }

      // Refresh Token도 만료된 경우: 에러 플래그 설정 → 미들웨어에서 강제 로그아웃 처리
      if (nowSec >= (token.refreshTokenExpires ?? 0)) {
        return { ...token, error: "RefreshTokenExpired" as const };
      }

      // Access Token만 만료된 경우: 자동으로 Access Token 갱신
      return {
        ...token,
        accessTokenExpires: nowSec + ACCESS_TOKEN_TTL,
        error: undefined,
      };
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.loginId = (token.loginId as string | undefined) ?? "";
      }
      // 세션 만료 에러를 클라이언트에 전달 (미들웨어에서 처리)
      if (token.error) {
        session.error = token.error as "RefreshTokenExpired";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
