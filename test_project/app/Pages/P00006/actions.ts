"use server";

export type TickSnapshot = {
  at: string;
  theme: "light" | "dark";
  count: number;
  note: string;
};

export async function saveTickSnapshotAction(input: {
  theme: "light" | "dark";
  count: number;
}): Promise<TickSnapshot> {
  // 서버 액션 지연을 조금 주어 비동기 흐름을 관찰하기 쉽게 만든다.
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    at: new Date().toLocaleTimeString("ko-KR"),
    theme: input.theme,
    count: input.count,
    note: "서버 액션에서 최신 상태를 기록했습니다.",
  };
}

