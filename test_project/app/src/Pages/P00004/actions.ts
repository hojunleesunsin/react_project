"use server";

import type { ProfileFormState } from "./form-state";

export async function updateProfileAction(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  const fieldErrors: ProfileFormState["fieldErrors"] = {};

  if (name.length < 2) {
    fieldErrors.name = "이름은 2자 이상이어야 합니다.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "이메일 형식이 올바르지 않습니다.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "입력값을 확인해주세요.",
      fieldErrors,
      values: { name, email },
    };
  }

  // 실무에선 여기서 DB/API 호출
  await new Promise((r) => setTimeout(r, 700));

  return {
    success: true,
    message: "프로필이 저장되었습니다.",
    fieldErrors: {},
    values: { name, email },
  };
}