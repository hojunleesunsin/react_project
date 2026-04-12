"use client";

import { Suspense, use, useState } from "react";
import { loadUsersAction, type UserRow } from "./actions";
import { ThemeReaderCard } from "./ThemeReaderCard";
import { ThemeContext } from "./theme-context";

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

/** 같은 파일에 둔 자식 예시 — theme-context만 import 해서 읽음 */
function ThemeHint() {
  const theme = use(ThemeContext);
  return (
    <p className="m-0 text-xs text-slate-600">
      <code>use(ThemeContext)</code> → 현재 테마:{" "}
      <strong className={theme === "dark" ? "text-indigo-700" : "text-amber-700"}>{theme}</strong>
    </p>
  );
}

/** Page의 직접 자식이 아닌 깊은 자손에 ThemeReaderCard를 넣어도 Context는 동일하게 읽힘 */
function ThemeSectionBody() {
  return (
    <div className="rounded-md border border-dashed border-slate-300 p-2">
      <p className="mb-2 text-[11px] text-slate-500">
        아래는 <code>ThemeReaderCard.tsx</code> 별도 파일 컴포넌트 — props 없이 <code>use(ThemeContext)</code>만 사용
      </p>
      <ThemeReaderCard />
    </div>
  );
}

export default function Page() {
  const [usersPromise, setUsersPromise] = useState<Promise<UserRow[]> | null>(null);
  const [requestedCount, setRequestedCount] = useState(0);
  const [pageTheme, setPageTheme] = useState<"light" | "dark">("light");

  const onLoadUsers = () => {
    setRequestedCount((prev) => prev + 1);
    setUsersPromise(loadUsersAction());
  };

  return (
    <ThemeContext.Provider value={pageTheme}>
      <main className="mx-auto mt-10 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="m-0 text-2xl font-bold">P00009 - 혼합형(use + 서버 액션 직접 호출)</h1>
        <p className="mb-4 mt-2 text-sm text-slate-600">
          버튼 클릭으로 서버 액션 Promise를 만들고, 하위 컴포넌트에서 <code>use(promise)</code>로 값을 읽습니다.
        </p>
        <p className="mb-4 text-xs text-slate-500">
          에러 전파 테스트: <code>actions.ts</code>의 테스트용 <code>throw</code> 주석을 해제하고 버튼을 눌러보세요.
        </p>

        <section className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
          <h2 className="m-0 text-sm font-semibold text-slate-800">use(Context) 예시</h2>
          <p className="mb-3 mt-1 text-xs text-slate-600">
            <strong>부모(Page)</strong>는 <code>ThemeContext.Provider value=&#123;...&#125;</code>로만 감쌉니다.{" "}
            <strong>자식</strong>은 <code>use(ThemeContext)</code>로 읽습니다. (
            <code>createContext</code>는 <code>theme-context.tsx</code>에서 한 번만 정의)
          </p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600">페이지 테마:</span>
            <button
              type="button"
              onClick={() => setPageTheme("light")}
              className={`rounded px-2 py-1 text-xs font-medium ${
                pageTheme === "light" ? "bg-amber-200 text-amber-900" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              light
            </button>
            <button
              type="button"
              onClick={() => setPageTheme("dark")}
              className={`rounded px-2 py-1 text-xs font-medium ${
                pageTheme === "dark" ? "bg-indigo-200 text-indigo-900" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              dark
            </button>
          </div>
          <ThemeHint />
          <div className="mt-3 space-y-2">
            <ThemeSectionBody />
          </div>
          <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
            <p className="m-0 mb-2 text-xs font-medium text-slate-700">중첩 Provider (안쪽이 우선)</p>
            <ThemeContext.Provider value="dark">
              <ThemeHint />
              <div className="mt-2">
                <ThemeReaderCard />
              </div>
            </ThemeContext.Provider>
            <p className="mb-0 mt-2 text-[11px] text-slate-500">
              안쪽 Provider가 <code>dark</code>로 고정되어 있어, 위 두 컴포넌트 모두 <code>dark</code>를 읽습니다.
            </p>
          </div>
        </section>

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
    </ThemeContext.Provider>
  );
}
