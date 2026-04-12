"use client";

import { useActionState } from "react";
// import { useActionState, useState } from "react";
import { signupAction } from "./actions";
import { initialSignupState } from "./form-state";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 font-semibold text-white ${
        pending ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {pending ? "제출 중..." : "가입 요청"}
    </button>
  );
}

export default function Page() {
  // useActionState:
  // [state, formAction]을 반환하고, formAction이 실행되면
  // 서버 액션의 반환값으로 state가 자동 갱신된다.
  // 세 번째 isPending: useFormStatus 없이 제출 중 여부 표시에 사용
  const [state, formAction, isPending] = useActionState(signupAction, initialSignupState);

  // --- 기존: react-dom의 useFormStatus 없이 클라이언트 상태로 pending 제어 + 래퍼 핸들러 ---
  // const [state, formAction] = useActionState(signupAction, initialSignupState);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  //
  // async function handleSubmit(formData: FormData) {
  //   setIsSubmitting(true);
  //   try {
  //     await formAction(formData);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }
  // <form action={handleSubmit} ...>
  // <SubmitButton pending={isSubmitting} />

  return (
    <main className="mx-auto mt-10 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold">P00005 - useActionState 예시</h1>
      <p className="mb-5 text-sm text-slate-600">
        폼 제출 - 서버 검증 - 상태 반영 흐름을 한 페이지에서 확인하는 예시입니다.
      </p>

      <form action={formAction} className="grid gap-4">
        <div className="grid gap-1">
          <label htmlFor="name" className="text-sm font-semibold">
            이름
          </label>
          <input
            id="name"
            name="name"
            defaultValue={state.values.name}
            placeholder="홍길동"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          {state.fieldErrors.name ? (
            <p className="text-xs text-red-600">{state.fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-semibold">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={state.values.email}
            placeholder="you@example.com"
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          {state.fieldErrors.email ? (
            <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
          ) : null}
        </div>

        <SubmitButton pending={isPending} />
      </form>

      <div className="mt-6 rounded-md bg-slate-50 p-3 text-sm">
        <p className="m-0">
          제출 횟수: <strong>{state.submitCount}</strong>
        </p>
        <p className={`m-0 mt-1 font-semibold ${state.ok ? "text-emerald-700" : "text-slate-700"}`}>
          {state.message || "아직 제출하지 않았습니다."}
        </p>
      </div>
    </main>
  );
}
