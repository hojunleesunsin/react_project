 "use client";

import { Suspense, use, useState } from "react";
import { loadUsersAction, type UserRow } from "./actions";

type UserListProps = {
  usersPromise: Promise<UserRow[]>;
};

function UserList({ usersPromise }: UserListProps) {
  const users = use(usersPromise);

  return (
    <ul className="grid gap-2">
      {users.map((user) => (
        <li key={user.id} className="rounded-md border border-slate-200 px-3 py-2">
          <strong>{user.name}</strong> - {user.team}
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  const [usersPromise, setUsersPromise] = useState<Promise<UserRow[]> | null>(null);
  const [requestedCount, setRequestedCount] = useState(0);

  const onLoadUsers = () => {
    setRequestedCount((prev) => prev + 1);
    setUsersPromise(loadUsersAction());
  };

  return (
    <main className="mx-auto mt-10 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="m-0 text-2xl font-bold">P00009 - 혼합형(use + 서버 액션 직접 호출)</h1>
      <p className="mb-4 mt-2 text-sm text-slate-600">
        버튼 클릭으로 서버 액션 Promise를 만들고, 하위 컴포넌트에서 <code>use(promise)</code>로 값을 읽습니다.
      </p>
      <p className="mb-4 text-xs text-slate-500">
        에러 전파 테스트: <code>actions.ts</code>의 테스트용 <code>throw</code> 주석을 해제하고 버튼을 눌러보세요.
      </p>

      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onLoadUsers}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          사용자 목록 불러오기
        </button>
        <span className="text-sm text-slate-600">요청 횟수: {requestedCount}</span>
      </div>

      {usersPromise ? (
        <Suspense fallback={<p className="text-sm text-slate-500">사용자 목록 로딩 중...</p>}>
          <UserList usersPromise={usersPromise} />
        </Suspense>
      ) : (
        <p className="text-sm text-slate-500">버튼을 눌러 서버 액션을 호출하세요.</p>
      )}
    </main>
  );
}

