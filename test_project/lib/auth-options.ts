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

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
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
      if (user) {
        token.loginId = (user as { loginId?: string }).loginId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.loginId = (token.loginId as string | undefined) ?? "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
