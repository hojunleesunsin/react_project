"use server";

export type EchoData = {
  original: string;
  uppercased: string;
  length: number;
};

export type SubmitTextResult =
  | { ok: true; data: EchoData }
  | { ok: false; fieldError: string };

export async function submitTextAction(rawText: string): Promise<SubmitTextResult> {
  const text = rawText.trim();

  await new Promise((resolve) => setTimeout(resolve, 400));

  // 예상 가능한 검증 실패는 throw 대신 반환값으로 처리한다.
  if (!text) {
    return { ok: false, fieldError: "입력값이 비어 있습니다. 텍스트를 입력해주세요." };
  }

  // 예상 불가능한 장애 예시: error.tsx 경계 동작 확인용
  if (text.toLowerCase() === "crash") {
    throw new Error("서버에서 예기치 못한 오류가 발생했습니다.");
  }

  return {
    ok: true,
    data: {
      original: text,
      uppercased: text.toUpperCase(),
      length: text.length,
    },
  };
}

