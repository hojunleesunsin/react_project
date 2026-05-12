import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import oracledb from "oracledb";
import type { DefaultSession } from "next-auth";
import { getOracleConnection } from "@/lib/oracle";

/**
 * NextAuth Session 타입 확장
 * - 기본 Session.user에는 id, loginId가 없으므로 직접 추가 선언
 * - 이 선언이 없으면 session.user.id, session.user.loginId 접근 시 TS 에러 발생
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      loginId: string;
    } & DefaultSession["user"]; // 기본 필드(name, email, image)는 그대로 유지
  }
  // authorize()가 반환하는 User 객체 타입에 loginId 추가
  interface User {
    loginId?: string;
  }
}

/**
 * NextAuth JWT 타입 확장
 * - 브라우저 쿠키에 저장되는 JWT 토큰 안에 loginId를 담기 위해 선언
 * - 이 선언이 없으면 jwt() 콜백에서 token.loginId 접근 시 TS 에러 발생
 */
declare module "next-auth/jwt" {
  interface JWT {
    loginId?: string;
  }
}

// Oracle DB 쿼리 결과 행 타입 (실제 DB 컬럼명과 일치해야 함)
type EmployeeRow = {
  EMPLOYEE_ID: number;
  LOGIN_ID: string;
  FULL_NAME: string;
};

// JWT 세션 유효 기간 (현재 15분 — 사내 환경에 맞게 조정)
const SESSION_TTL = 15 * 60;

/**
 * NextAuth 설정
 * - handlers : /api/auth/[...nextauth] 라우트에서 사용하는 GET/POST 핸들러
 * - auth     : 서버 컴포넌트에서 await auth() 로 세션을 가져올 때 사용
 * - signIn   : 서버 액션에서 로그인을 직접 호출할 때 사용
 * - signOut  : 서버 액션에서 로그아웃을 직접 호출할 때 사용
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login", // 미인증 접근 시 리다이렉트할 로그인 페이지 경로
  },
  session: {
    strategy: "jwt",      // DB 없이 쿠키의 JWT만으로 세션 관리
    maxAge: SESSION_TTL,  // JWT 쿠키 만료 시간
  },
  callbacks: {
    /**
     * jwt 콜백 — JWT 토큰을 생성·갱신할 때마다 호출
     * - 최초 로그인 시: user 객체가 있으므로 토큰에 커스텀 필드 추가
     * - 이후 요청 시: user가 없으므로 기존 토큰을 그대로 반환
     * - 반환값이 브라우저 쿠키(next-auth.session-token)에 암호화 저장됨
     */
    jwt({ token, user }) {
      if (user) token.loginId = user.loginId;
      return token;
    },

    /**
     * session 콜백 — await auth() 또는 useSession() 호출 시 실행
     * - JWT 토큰(쿠키)에서 꺼낸 값을 session.user 형태로 가공해서 반환
     * - 여기서 반환한 값이 컴포넌트에서 실제로 사용하는 세션 객체
     */
    session({ session, token }) {
      session.user.id = token.sub ?? "";           // JWT의 sub → user.id
      session.user.loginId = token.loginId ?? "";  // JWT의 loginId → user.loginId
      return session;
    },
  },
  providers: [
    /**
     * CredentialsProvider — 아이디/비밀번호 기반 로그인 처리
     * - credentials: 로그인 폼에서 받을 입력 필드 정의
     * - authorize: 실제 인증 로직, null 반환 시 로그인 실패
     */
    CredentialsProvider({
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },

      /**
       * authorize — 로그인 폼 제출 시 서버에서 실행되는 인증 함수
       * - DB에서 loginId로 직원 조회 후 존재하면 로그인 성공
       * - 반환한 객체가 jwt() 콜백의 user 파라미터로 전달됨
       * - null 반환 시 로그인 실패 (클라이언트에 result.error 전달)
       *
       * TODO: 사내 환경 확인 후 비밀번호 검증 로직 추가 필요
       */
      async authorize(credentials) {
        const loginId = (credentials.loginId as string)?.trim();
        if (!loginId) return null;

        try {
          const connection = await getOracleConnection();
          try {
            // WHERE 조건과 바인드 파라미터를 별도로 관리 — 조건 동적 추가 가능
            const conditions: string[] = [];
            const params: Record<string, string | number | null> = {};

            // 필수 조건: loginId 일치 여부
            conditions.push("UPPER(LOGIN_ID) = UPPER(:loginId)");
            params.loginId = loginId;

            // 동적 조건 추가 예시 (필요 시 주석 해제)
            // conditions.push("IS_ACTIVE = :isActive");
            // params.isActive = "Y";

            const lines = [
              "SELECT",
              "  EMPLOYEE_ID,",
              "  LOGIN_ID,",
              "  FULL_NAME",
              "FROM MST_EMPLOYEE",
            ];

            // 조건이 하나라도 있을 때만 WHERE 절 추가
            if (conditions.length > 0) {
              lines.push(`WHERE ${conditions.join(" AND ")}`);
            }

            const sql = lines.join("\n");

            const result = await connection.execute(
              sql,
              params as oracledb.BindParameters,         // 바인드 변수 (SQL Injection 방지)
              { outFormat: oracledb.OUT_FORMAT_OBJECT }, // 결과를 객체 배열로 반환
            );

            const employee = (result.rows?.[0] ?? null) as EmployeeRow | null;
            if (!employee) return null; // 존재하지 않는 계정이면 로그인 실패

            // 반환값 → jwt() 콜백 → 쿠키 → session.user 순으로 전달됨
            return {
              id: String(employee.EMPLOYEE_ID),
              loginId: employee.LOGIN_ID,
              name: employee.FULL_NAME,
            };
          } finally {
            await connection.close(); // 커넥션 풀에 반납
          }
        } catch (error) {
          console.error("Credentials authorize failed:", error);
          return null;
        }
      },
    }),
  ],
});
