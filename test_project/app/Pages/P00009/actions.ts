"use server";

export type UserRow = {
  id: number;
  name: string;
  team: "Frontend" | "Backend" | "Data";
};

async function getUsers(): Promise<UserRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 0));

  // error.tsx 테스트용 예시:
  // 아래 주석을 해제하고 페이지에서 버튼 클릭 시,
  // Promise reject -> use(promise) -> P00009/error.tsx 경계로 전파된다.
  throw new Error("테스트용 서버 액션 오류: P00009 getUsers 실패");

  return [
    { id: 1, name: "Kim", team: "Frontend" },
    { id: 2, name: "Lee", team: "Backend" },
    { id: 3, name: "Park", team: "Data" },
    { id: 4, name: "Choi", team: "Frontend" },
    { id: 5, name: "Jung", team: "Backend" },
  ];
}

export async function loadUsersAction(): Promise<UserRow[]> {
  return getUsers();
}

