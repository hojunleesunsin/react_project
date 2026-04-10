"use client";

import { Select } from "@/components/common/Select";

export type SearchField = {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
};

type SearchProps = {
  title?: string;
  fields: SearchField[];
  onChangeField: (key: string, value: string) => void;
  onSearch: () => void;
  isSearching?: boolean;
  onReset?: () => void;
  searchLabel?: string;
  resetLabel?: string;
};

export function Search({
  title = "조회조건",
  fields,
  onChangeField,
  onSearch,
  isSearching = false,
  onReset,
  searchLabel = "조회",
  resetLabel = "초기화",
}: SearchProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>

      <div className="grid gap-3">
        {fields.map((field) => (
          <label key={field.key} className="grid gap-1 text-sm font-medium">
            {field.label}
            <Select
              value={field.value}
              onChange={(e) => onChangeField(field.key, e.target.value)}
              options={field.options}
            />
          </label>
        ))}

        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSearch}
            disabled={isSearching}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {isSearching ? "조회 중..." : searchLabel}
          </button>
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {resetLabel}
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
