'use server';

import oracledb from 'oracledb';
import { getOracleConnection } from '@/lib/oracle';

export type SearchFilter = {
  keyword: string;
  page: number;
  pageSize: number;
};

export type GridRow = Record<string, unknown>;

export type SearchResult = {
  rows: GridRow[];
  totalCount: number;
  loadedAt: string;
};

function quoteIdentifier(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

export async function searchP00016Action(filter: SearchFilter): Promise<SearchResult> {
  const connection = await getOracleConnection();
  const offset = (filter.page - 1) * filter.pageSize;
  const keyword = filter.keyword.trim();

  try {
    const visibleColumnsResult = await connection.execute(
      `SELECT COLUMN_NAME
       FROM USER_TAB_COLUMNS
       WHERE TABLE_NAME = 'MST_EMPLOYEE'
         AND COLUMN_NAME <> 'PASSWORD_HASH'
       ORDER BY COLUMN_ID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const visibleColumns = (
      (visibleColumnsResult.rows ?? []) as Array<{
        COLUMN_NAME: string;
      }>
    ).map((row) => row.COLUMN_NAME);

    if (!visibleColumns.length) {
      return {
        rows: [],
        totalCount: 0,
        loadedAt: new Date().toLocaleTimeString(),
      };
    }

    const selectList = visibleColumns.map(quoteIdentifier).join(', ');

    const countResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL_COUNT
       FROM MST_EMPLOYEE
       WHERE (:keyword IS NULL OR LOWER(FULL_NAME) LIKE '%' || LOWER(:keyword) || '%')`,
      {
        keyword: keyword || null,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rowsResult = await connection.execute(
      `SELECT ${selectList}
       FROM MST_EMPLOYEE
       WHERE (:keyword IS NULL OR LOWER(FULL_NAME) LIKE '%' || LOWER(:keyword) || '%')
       ORDER BY EMPLOYEE_ID DESC
       OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      {
        keyword: keyword || null,
        offset,
        pageSize: filter.pageSize,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const totalCount = Number(
      (
        (countResult.rows ?? []) as Array<{
          TOTAL_COUNT: number;
        }>
      )[0]?.TOTAL_COUNT ?? 0,
    );

    const rows = (rowsResult.rows ?? []) as GridRow[];

    return {
      rows,
      totalCount,
      loadedAt: new Date().toLocaleTimeString(),
    };
  } finally {
    await connection.close();
  }
}
