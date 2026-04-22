'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GridRow, SearchFilter, searchP00016Action } from './actions';

const INITIAL_FILTER: SearchFilter = {
  keyword: '',
  page: 1,
  pageSize: 50,
};

export default function Page() {
  const [draftFilter, setDraftFilter] = useState<SearchFilter>(INITIAL_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<SearchFilter | null>(null);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo<ColumnDef<GridRow>[]>(() => {
    const firstRow = rows[0];
    if (!firstRow) return [];
    return Object.keys(firstRow).map((key) => ({
      id: key,
      accessorFn: (row) => row[key],
      header: key,
      cell: (ctx) => {
        const value = ctx.getValue();
        if (value == null) return '-';
        if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      },
    }));
  }, [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 38,
    overscan: 8,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / (appliedFilter?.pageSize ?? INITIAL_FILTER.pageSize)));

  useEffect(() => {
    if (!appliedFilter) return;
    let cancelled = false;

    const runSearch = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await searchP00016Action(appliedFilter);
        if (cancelled) return;
        setRows(result.rows);
        setTotalCount(result.totalCount);
        setLoadedAt(result.loadedAt);
      } catch {
        if (cancelled) return;
        setError('조회 중 오류가 발생했습니다.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    runSearch();

    return () => {
      cancelled = true;
    };
  }, [appliedFilter]);

  const onSearchClick = () => {
    setAppliedFilter({ ...draftFilter, page: 1 });
  };

  const onPageMove = (nextPage: number) => {
    if (!appliedFilter) return;
    const page = Math.min(Math.max(1, nextPage), totalPages);
    const nextFilter = { ...appliedFilter, page };
    setAppliedFilter(nextFilter);
    setDraftFilter((prev) => ({ ...prev, page }));
  };

  const virtualRows = rowVirtualizer.getVirtualItems();
  const rowModel = table.getRowModel().rows;
  const colCount = Math.max(columns.length, 1);
  const gridTemplateColumns = `repeat(${colCount}, minmax(180px, 180px))`;
  const gridWidth = `${colCount * 180}px`;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">P00016 - SELECT * + 첫 행 기반 동적 컬럼</h1>
          <p className="mt-1 text-sm text-slate-600">
            MST_EMPLOYEE를 SELECT *로 조회하고 첫 번째 행의 키 목록으로 컬럼을 생성합니다.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_120px]">
            <label className="grid gap-1 text-sm font-semibold">
              키워드
              <input
                value={draftFilter.keyword}
                onChange={(e) => setDraftFilter((prev) => ({ ...prev, keyword: e.target.value }))}
                placeholder="FULL NAME 검색색"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              />
            </label>

            <button
              type="button"
              onClick={onSearchClick}
              disabled={isLoading}
              className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {isLoading ? '조회 중...' : '조회'}
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-600">
            <p>총 건수: {totalCount.toLocaleString()}</p>
            <p>페이지: {appliedFilter?.page ?? 1} / {totalPages}</p>
            <p>마지막 조회: {loadedAt ?? '-'}</p>
            {error ? <p className="text-rose-700">에러: {error}</p> : null}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <div style={{ width: gridWidth, minWidth: '100%' }}>
              {columns.length ? (
                <div
                  className="border-b border-slate-200 bg-slate-50 px-2 py-2 text-sm font-semibold"
                  style={{
                    display: 'grid',
                    gridTemplateColumns,
                    width: gridWidth,
                  }}
                >
                  {table.getFlatHeaders().map((header) => (
                    <div key={header.id} className="truncate px-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  ))}
                </div>
              ) : null}

              <div ref={containerRef} className="h-[420px] overflow-y-auto overflow-x-hidden" style={{ width: gridWidth }}>
                <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: gridWidth }}>
                  {virtualRows.map((virtualRow) => {
                    const row = rowModel[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        className="border-b border-slate-100 px-2 text-sm"
                        style={{
                          display: 'grid',
                          gridTemplateColumns,
                          width: gridWidth,
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: virtualRow.size,
                          transform: `translateY(${virtualRow.start}px)`,
                          alignItems: 'center',
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <div key={cell.id} className="truncate px-1" title={String(cell.getValue() ?? '-')}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {!isLoading && rows.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                      조회 버튼을 눌러 데이터를 불러오세요.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2 text-sm">
            <button
              type="button"
              onClick={() => onPageMove((appliedFilter?.page ?? 1) - 1)}
              disabled={isLoading || (appliedFilter?.page ?? 1) <= 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              이전
            </button>
            <button
              type="button"
              onClick={() => onPageMove((appliedFilter?.page ?? 1) + 1)}
              disabled={isLoading || (appliedFilter?.page ?? 1) >= totalPages}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
