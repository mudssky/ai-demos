"use client";
import Link from "next/link";
import type { FC } from "react";
import { useSearch } from "@/hooks/useSearch";
import type { DemoSummary, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  items: DemoSummary[];
  locale: Locale;
  className?: string;
}

const SearchBar: FC<SearchBarProps> = ({ items, locale, className }) => {
  const { query, setQuery, open, setOpen, results, total } = useSearch(items);
  const isZh = locale === "zh-CN";
  const placeholder = isZh
    ? "搜索示例、标签、模型"
    : "Search demos, tags, models";
  const labelStats = isZh ? "结果" : "results";
  const labelEmpty = isZh ? "无匹配" : "No matches";
  return (
    <div className={cn("relative z-30", className)}>
      <input
        aria-label="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur transition-all duration-200 placeholder:text-slate-400 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {open && query.trim().length > 0 ? (
        <div className="absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
            <span>
              {total} {labelStats}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
              {locale}
            </span>
          </div>
          <div className="max-h-64 overflow-auto">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                {labelEmpty}
              </div>
            ) : (
              results.map((d) => (
                <Link
                  key={d.slug}
                  href={d.route ?? `/${locale}/demo/${d.slug}`}
                  className="block px-4 py-3 text-sm transition-colors hover:bg-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{d.title}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {d.type.toUpperCase()}
                    </span>
                  </div>
                  {d.description ? (
                    <div className="line-clamp-1 text-xs text-slate-500">
                      {d.description}
                    </div>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
