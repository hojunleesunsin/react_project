"use client";

import { Suspense, use, useMemo, createContext, useContext, type ReactNode } from "react";

export type DataGridColumn<T> = {
  key: keyof T;
  header: string;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], row: T) => ReactNode;
};

export type DataGridProps<T> = {
  columns: DataGridColumn<T>[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
  skeletonRows?: number;
} & (
  | {
      rows: T[];
      rowsPromise?: never;
    }
  | {
      rows?: never;
      rowsPromise: Promise<T[]>;
    }
);

// 1. DataGrid를 위한 Context 생성
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataGridContext = createContext<Omit<DataGridProps<any>, 'rows' | 'rowsPromise'> | null>(null);

// 2. 하위 컴포넌트에서 쉽게 사용할 수 있는 Custom Hook 제공
export function useDataGridContext<T>() {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error("useDataGridContext must be used within a DataGrid");
  }
  return context as Omit<DataGridProps<T>, 'rows' | 'rowsPromise'>;
}

type DataGridTableProps<T> = {
  columns: DataGridColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyMessage: string;
};

const alignClassMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

function DataGridTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage,
}: DataGridTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-3 py-2.5 text-sm font-semibold ${alignClassMap[column.align ?? "left"]}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, idx) => (
              <tr key={rowKey(row, idx)} className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-800/40">
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={String(column.key)}
                      className={`border-t border-slate-100 px-3 py-2.5 text-sm dark:border-slate-700 ${alignClassMap[column.align ?? "left"]}`}
                    >
                      {column.render ? column.render(value, row) : String(value ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="border-t border-slate-100 px-3 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DataGridSkeleton({
  columnCount,
  rowCount,
}: {
  columnCount: number;
  rowCount: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid gap-0">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columnCount }).map((_, idx) => (
            <div
              key={`head-${idx}`}
              className="h-10 border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>
        {Array.from({ length: rowCount }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="grid border-b border-slate-100 last:border-b-0 dark:border-slate-700"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columnCount }).map((__, colIdx) => (
              <div key={`cell-${rowIdx}-${colIdx}`} className="px-3 py-3">
                <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DataGridAsyncInner<T>({
  columns,
  rowKey,
  rowsPromise,
  emptyMessage,
}: {
  columns: DataGridColumn<T>[];
  rowKey: (row: T, index: number) => string;
  rowsPromise: Promise<T[]>;
  emptyMessage: string;
}) {
  const stablePromise = useMemo(() => rowsPromise, [rowsPromise]);
  const rows = use(stablePromise);

  return (
    <DataGridTable
      columns={columns}
      rows={rows}
      rowKey={rowKey}
      emptyMessage={emptyMessage}
    />
  );
}

export function DataGrid<T>(props: DataGridProps<T>) {
  const emptyMessage = props.emptyMessage ?? "데이터가 없습니다.";
  const skeletonRows = props.skeletonRows ?? 6;

  // 3. Provider에 전달할 Context Value 메모이제이션
  const contextValue = useMemo(() => ({
    columns: props.columns,
    rowKey: props.rowKey,
    emptyMessage,
    skeletonRows
  }), [props.columns, props.rowKey, emptyMessage, skeletonRows]);

  if ("rows" in props && props.rows) {
    return (
      <DataGridContext.Provider value={contextValue}>
        <DataGridTable
          columns={props.columns}
          rows={props.rows}
          rowKey={props.rowKey}
          emptyMessage={emptyMessage}
        />
      </DataGridContext.Provider>
    );
  }

  return (
    <DataGridContext.Provider value={contextValue}>
      <Suspense
        fallback={
          <DataGridSkeleton
            columnCount={props.columns.length}
            rowCount={skeletonRows}
          />
        }
      >
        <DataGridAsyncInner
          columns={props.columns}
          rowKey={props.rowKey}
          rowsPromise={props.rowsPromise}
          emptyMessage={emptyMessage}
        />
      </Suspense>
    </DataGridContext.Provider>
  );
}
