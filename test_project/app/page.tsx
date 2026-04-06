import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto mt-12 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold">페이지 메뉴</h1>

      <ul className="grid gap-2">
        <li>
          <Link className="text-blue-600 hover:underline" href="/Pages/P00001">
            P00001 - useState 예제
          </Link>
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/Pages/P00002">
            P00002 - useTransition 예제
          </Link>
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/Pages/P00003">
            P00003 - useDeferredValue 예제
          </Link>
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/Pages/P00004">
            P00004 - 대시보드(독립 로딩/테마/폰트)
          </Link>
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/Pages/P00005">
            P00005 - useActionState 폼 예제
          </Link>
        </li>
      </ul>
    </main>
  );
}