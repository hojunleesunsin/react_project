"use server";

import type { SignupState } from "./form-state";

export async function signupAction(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  // useActionState의 핵심: 액션은 이전 상태(prevState)를 인자로 받는다.
  // 그래서 submit 횟수/최근 값 같은 "누적 상태"를 서버에서 안전하게 관리할 수 있다.
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  const fieldErrors: SignupState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "이름은 2자 이상이어야 합니다.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "이메일 형식이 올바르지 않습니다.";
  }

  // 요청-응답 흐름을 보기 쉽게 인위적으로 지연
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...prevState,
      ok: false,
      message: "검증 실패: 입력값을 확인해주세요.",
      submitCount: prevState.submitCount + 1,
      fieldErrors,
      values: { name, email },
    };
  }

  return {
    ...prevState,
    ok: true,
    message: `제출 성공: ${name} (${email})`,
    submitCount: prevState.submitCount + 1,
    fieldErrors: {},
    values: { name, email },
  };
}

