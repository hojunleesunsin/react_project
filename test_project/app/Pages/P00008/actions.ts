"use server";

export type NoteInput = {
  title: string;
  description: string;
};

export type SaveNoteResult = {
  ok: boolean;
  message: string;
  values: NoteInput;
  errors: {
    title?: string;
    description?: string;
  };
};

export async function saveNoteAction(input: NoteInput): Promise<SaveNoteResult> {
  const title = String(input.title ?? "").trim();
  const description = String(input.description ?? "").trim();

  const errors: SaveNoteResult["errors"] = {};
  if (title.length < 2) errors.title = "제목은 2자 이상이어야 합니다.";
  if (description.length < 5) errors.description = "설명은 5자 이상이어야 합니다.";

  await new Promise((resolve) => setTimeout(resolve, 700));

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "검증 실패: 입력값을 확인하세요.",
      values: { title, description },
      errors,
    };
  }

  return {
    ok: true,
    message: `저장 완료: ${title}`,
    values: { title, description },
    errors: {},
  };
}

