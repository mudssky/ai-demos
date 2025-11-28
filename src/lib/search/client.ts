import type { DemoSummary, SearchIndex, SearchIndexEntry } from "@/lib/types";

let cachedIndex: SearchIndex | null = null;

export async function loadIndex(): Promise<SearchIndex> {
  if (cachedIndex) return cachedIndex;
  const res = await fetch("/search-index.json", { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load search index: ${res.status}`);
  const data = (await res.json()) as SearchIndex;
  cachedIndex = data;
  return data;
}

function tokenize(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  const tokens: string[] = [];
  // word tokens
  for (const w of q.split(/[^\p{L}\p{N}]+/u).filter(Boolean)) tokens.push(w);
  // chinese characters
  for (const ch of q.match(/[\u4e00-\u9fff]/g) ?? []) tokens.push(ch);
  return Array.from(new Set(tokens));
}

function scoreEntry(entry: SearchIndexEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const fields = {
    title: entry.title.toLowerCase(),
    description: (entry.description ?? "").toLowerCase(),
    tags: (entry.tags ?? []).map((t) => t.toLowerCase()),
    content: (entry.contentSnippet ?? "").toLowerCase(),
  };
  let score = 0;
  for (const t of tokens) {
    if (fields.title.includes(t)) score += 6;
    if (fields.tags.some((x) => x.includes(t))) score += 4;
    if (fields.description.includes(t)) score += 3;
    if (fields.content.includes(t)) score += 0.2;
  }
  // recency bonus only if there is a match
  if (score > 0 && entry.updatedAt) {
    const ageDays = Math.max(
      0,
      (Date.now() - new Date(entry.updatedAt).getTime()) / 86_400_000,
    );
    const bonus = Math.max(0, 6 - Math.min(ageDays / 30, 6));
    score += bonus;
  }
  return score;
}

export async function search(
  query: string,
  limit = 8,
): Promise<{ results: SearchIndexEntry[]; total: number }> {
  const index = await loadIndex();
  const tokens = tokenize(query);
  const scored = index.entries
    .map((e) => ({ e, s: scoreEntry(e, tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => {
      const diff = b.s - a.s;
      if (Math.abs(diff) < 0.5) {
        return compareDate(b.e.updatedAt, a.e.updatedAt);
      }
      return diff;
    });
  const results = scored.slice(0, limit).map((x) => x.e);
  return { results, total: scored.length };
}

function compareDate(a?: string, b?: string): number {
  const ta = a ? new Date(a).getTime() : 0;
  const tb = b ? new Date(b).getTime() : 0;
  return ta - tb;
}

export function toSummary(entry: SearchIndexEntry): DemoSummary {
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    type: entry.type,
    tags: entry.tags,
    ai: entry.ai,
    createdAt: entry.updatedAt ?? new Date().toISOString(),
  };
}
