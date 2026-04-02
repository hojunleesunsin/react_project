"use client";

import { useFormStatus } from "react-dom";

export function FormActions() {
  const { pending } = useFormStatus();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #222",
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}