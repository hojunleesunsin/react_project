import Link from "next/link";

const pageLinks = [
  "P00001",
  "P00002",
  "P00003",
  "P00004",
  "P00005",
  "P00006",
  "P00007",
  "P00008",
  "P00009",
  "P00010",
  "P00011",
  "P00012",
  "P00013",
  "P00018",
];

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl p-6">
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">React 실습 페이지</h1>
              <p className="mt-1 text-sm text-slate-600">
                공통 레이아웃은 유지하고, 각 페이지는 내용만 다르게 렌더링됩니다.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              메뉴로 이동
            </Link>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2">
            {pageLinks.map((id) => (
              <Link
                key={id}
                href={`/Pages/${id}`}
                className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                {id}
              </Link>
            ))}
          </nav>
        </header>

        <section className="mt-4">{children}</section>
      </div>
    </main>
  );
}
