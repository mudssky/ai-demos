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
  const placeholder =
    locale === "zh" ? "搜索示例、标签、模型" : "Search demos, tags, models";
  const labelStats = locale === "zh" ? "结果" : "results";
  const labelEmpty = locale === "zh" ? "无匹配" : "No matches";
  return (
    <div className={cn("relative", className)}>
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
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {open && query.trim().length > 0 ? (
        <div className="absolute z-10 mt-2 w-full rounded-md border bg-background shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <span>
              {total} {labelStats}
            </span>
            <span className="uppercase">{locale}</span>
          </div>
          <div className="max-h-64 overflow-auto">
            {results.length === 0 ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">
                {labelEmpty}
              </div>
            ) : (
              results.map((d) => (
                <Link
                  key={d.slug}
                  href={`/${locale}/demo/${d.slug}`}
                  className="block px-3 py-2 text-sm hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{d.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.type.toUpperCase()}
                    </span>
                  </div>
                  {d.description ? (
                    <div className="line-clamp-1 text-xs text-muted-foreground">
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
