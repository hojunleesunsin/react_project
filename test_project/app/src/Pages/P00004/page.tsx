"use client";

import { useActionState, useOptimistic } from "react";
import { updateProfileAction } from "./actions";
import { initialProfileState } from "./form-state";
import { InputField } from "./components/InputField";
import { FormActions } from "./components/FormActions";

export default function Page() {
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialProfileState
  );
  const [optimisticValues, setOptimisticValues] = useOptimistic(
    state.values,
    (_current, next: { name: string; email: string }) => next
  );

  async function submitWithOptimistic(formData: FormData) {
    setOptimisticValues({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
    });
    await formAction(formData);
  }

  const isOptimistic =
    optimisticValues.name !== (state?.values?.name ?? "") ||
    optimisticValues.email !== (state?.values?.email ?? "");

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>프로필 수정</h1>
      <p style={{ color: "#666" }}>useActionState Test</p>

      <form action={submitWithOptimistic} style={{ display: "grid", gap: 14 }}>
        <InputField
          id="name"
          name="name"
          label="이름"
          defaultValue={state?.values?.name ?? ""}
          error={state?.fieldErrors?.name}
          placeholder="홍길동"
        />

        <InputField
          id="email"
          name="email"
          type="email"
          label="이메일"
          defaultValue={state?.values?.email ?? ""}
          error={state?.fieldErrors?.email}
          placeholder="you@example.com"
        />

        <FormActions />
      </form>

      <div style={{ marginTop: 12, fontSize: 14, color: "#444" }}>
        미리보기: {optimisticValues.name || "(이름 없음)"} /{" "}
        {optimisticValues.email || "(이메일 없음)"}
        {isOptimistic ? " (낙관적 반영 중...)" : ""}
      </div>

      {state.message ? (
        <p
          style={{
            marginTop: 12,
            color: state.success ? "#0a7a2f" : "#d33",
            fontWeight: 600,
          }}
        >
          {state.message}
        </p>
      ) : null}
    </main>
  );
}