import Link from "next/link";

const menuItems = [
  { href: "/Pages/P00001", title: "P00001", description: "useState 예제" },
  { href: "/Pages/P00002", title: "P00002", description: "useTransition 예제" },
  { href: "/Pages/P00003", title: "P00003", description: "useDeferredValue 예제" },
  { href: "/Pages/P00004", title: "P00004", description: "서버 컴포넌트 + 서버 함수 + 서버 액션" },
  { href: "/Pages/P00005", title: "P00005", description: "useActionState 폼 예제" },
  { href: "/Pages/P00006", title: "P00006", description: "useEffectEvent 예제" },
  { href: "/Pages/P00007", title: "P00007", description: "클라이언트에서 서버 액션 직접 호출" },
  { href: "/Pages/P00008", title: "P00008", description: "page.tsx(클라) + actions.ts(서버 액션)" },
  { href: "/Pages/P00009", title: "P00009", description: "React 19 use() API 예제" },
  { href: "/Pages/P00010", title: "P00010", description: "추가 실습 페이지" },
  { href: "/Pages/P00011", title: "P00011", description: "공용 Select + 공용 DataGrid 레이아웃" },
  { href: "/Pages/P00012", title: "P00012", description: "props 동기화 패턴 (key / 렌더보정 / controlled)" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">실습 메뉴</h1>
          <p className="mt-2 text-slate-600">
            각 페이지 예제를 카드 형태로 이동할 수 있습니다.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <article
              key={item.href}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-1 min-h-12 text-sm text-slate-600">{item.description}</p>
              <Link
                className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                href={item.href}
              >
                페이지 이동
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}