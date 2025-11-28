"use client";
import { useEffect, useMemo, useState } from "react";
import { search as searchIndex, toSummary } from "@/lib/search/client";
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
  const [indexResults, setIndexResults] = useState<DemoSummary[]>([]);
  const [indexTotal, setIndexTotal] = useState(0);

  const results = useMemo(() => {
    const q = normalize(query);
    if (q.length === 0) return [] as DemoSummary[];
    if (items.length === 0) return indexResults;
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
  }, [items, query, indexResults]);

  const total = useMemo(() => {
    if (query.trim().length === 0) return 0;
    if (items.length === 0) return indexTotal;
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
  }, [items, query, indexTotal]);

  // lazy index search when items are not provided
  useEffect(() => {
    const q = query.trim();
    if (items.length === 0 && q.length > 0) {
      void searchIndex(q, 8).then(({ results, total }) => {
        setIndexResults(results.map(toSummary));
        setIndexTotal(total);
      });
    }
    if (q.length === 0 && indexTotal !== 0) {
      setIndexResults([]);
      setIndexTotal(0);
    }
  }, [items.length, query, indexTotal]);

  return { query, setQuery, open, setOpen, results, total };
}
