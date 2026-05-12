"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * LoginPage — 로그인 페이지 (클라이언트 컴포넌트)
 *
 * 흐름:
 * 1. 사용자가 아이디/비밀번호 입력 후 제출
 * 2. signIn("credentials") 호출 → POST /api/auth/callback/credentials
 * 3. 서버의 authorize() 함수에서 DB 조회 및 인증 처리
 * 4. 성공 시 JWT 쿠키 발급 → callbackUrl로 이동
 * 5. 실패 시 에러 메시지 표시
 *
 * proxy.ts에 의해 토큰 없이 접근 가능한 유일한 공개 경로
 */
export default function LoginPage() {
  const router = useRouter();

  // proxy.ts에서 미인증 리다이렉트 시 ?callbackUrl=/원래경로 형태로 전달됨
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * onSubmit — 로그인 폼 제출 핸들러
   * - redirect: false 로 설정해 페이지 이동을 직접 제어
   * - result.error가 있으면 authorize()가 null을 반환한 것 (인증 실패)
   * - 성공 시 router.refresh()로 서버 컴포넌트 세션 상태를 최신화
   */
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        loginId,
        password,
        redirect: false, // 자동 리다이렉트 비활성화 — 결과를 직접 처리
      });

      if (!result || result.error) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      // 로그인 성공: 원래 접근하려던 페이지로 이동
      router.replace(callbackUrl);
      router.refresh(); // 서버 컴포넌트(layout 등)의 세션 캐시 갱신
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto mt-16 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm font-medium">아이디</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="loginId"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            type="password"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </main>
  );
}
