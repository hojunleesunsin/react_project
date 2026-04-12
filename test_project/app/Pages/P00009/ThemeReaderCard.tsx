"use client";

/**
 * 자식 컴포넌트 예시: props로 테마를 안 받고,
 * 조상에 있는 ThemeContext.Provider가 준 value만 use(ThemeContext)로 읽습니다.
 * (Page의 직계 자식이 아니어도, Provider 트리 아래면 동작합니다.)
 */
import { use } from "react";
import { ThemeContext } from "./theme-context";

export function ThemeReaderCard() {
  const theme = use(ThemeContext);

  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        theme === "dark"
          ? "border-indigo-300 bg-indigo-950 text-indigo-100"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      <code className="text-xs">ThemeReaderCard</code> — 자식에서 읽은 테마:{" "}
      <strong>{theme}</strong>
    </div>
  );
}
