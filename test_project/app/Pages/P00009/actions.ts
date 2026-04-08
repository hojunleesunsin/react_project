"use server";

export type UserRow = {
  id: number;
  name: string;
  team: "Frontend" | "Backend" | "Data";
};

async function getUsers(): Promise<UserRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 0));

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

