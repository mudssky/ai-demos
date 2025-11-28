"use client";
import { useMemo, useState } from "react";
import type { DemoSummary } from "@/lib/types";

export interface UseSearchState {
  query: string;
  setQuery: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  results: DemoSummary[];
  total: number;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function useSearch(items: DemoSummary[]): UseSearchState {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = normalize(query);
    if (q.length === 0) return [] as DemoSummary[];
    const filtered = items.filter((d) => {
      const fields = [
        d.slug,
        d.title,
        d.description ?? "",
        d.ai.model,
        d.ai.agent,
        ...d.tags,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
    return filtered.slice(0, 8);
  }, [items, query]);

  const total = useMemo(() => {
    if (query.trim().length === 0) return 0;
    return items.filter((d) => {
      const q = normalize(query);
      const fields = [
        d.slug,
        d.title,
        d.description ?? "",
        d.ai.model,
        d.ai.agent,
        ...d.tags,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return fields.some((f) => f.includes(q));
    }).length;
  }, [items, query]);

  return { query, setQuery, open, setOpen, results, total };
}
