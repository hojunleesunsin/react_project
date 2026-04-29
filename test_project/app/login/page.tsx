"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get("reason") === "session_expired";

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        loginId,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto mt-16 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>

      {isSessionExpired && (
        <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          장시간 미사용으로 세션이 만료되었습니다. 다시 로그인해 주세요.
        </div>
      )}

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
