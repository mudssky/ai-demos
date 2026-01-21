import { NextResponse } from "next/server";
import { z } from "zod";

const InputSchema = z.object({
  urls: z.array(z.string().url()).min(1),
  timeoutMs: z.number().int().positive().max(30000).optional(),
  concurrency: z.number().int().min(1).max(32).optional(),
});

type MetadataResult = {
  url: string;
  title?: string;
  faviconUrl?: string;
  error?: string;
};

function createPool<T, R>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  let index = 0;
  const results: R[] = new Array(items.length);

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await task(items[current]);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  return Promise.all(workers).then(() => results);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!match) return undefined;
  return match[1]?.trim() || undefined;
}

function extractFavicon(html: string, baseUrl: string): string | undefined {
  const match = html.match(/<link[^>]*rel=["']?[^"'>]*icon[^"'>]*[^>]*>/i);
  if (!match) return undefined;
  const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);
  if (!hrefMatch) return undefined;
  try {
    return new URL(hrefMatch[1], baseUrl).toString();
  } catch {
    return undefined;
  }
}

async function fetchMetadata(
  url: string,
  timeoutMs: number,
): Promise<MetadataResult> {
  try {
    const response = await fetchWithTimeout(
      url,
      { method: "GET", redirect: "follow" },
      timeoutMs,
    );
    const html = await response.text();
    const title = extractTitle(html);
    const faviconUrl =
      extractFavicon(html, response.url) ??
      (() => {
        try {
          const parsed = new URL(response.url);
          return `${parsed.origin}/favicon.ico`;
        } catch {
          return undefined;
        }
      })();

    return { url, title, faviconUrl };
  } catch (error) {
    return {
      url,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = InputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { urls, timeoutMs = 8000, concurrency = 8 } = parsed.data;
  const limitedConcurrency = Math.max(1, Math.min(32, concurrency));

  const results = await createPool(urls, limitedConcurrency, (url) =>
    fetchMetadata(url, timeoutMs),
  );

  return NextResponse.json({ results });
}
