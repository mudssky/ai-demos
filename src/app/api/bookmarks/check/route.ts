import { NextResponse } from "next/server";
import { z } from "zod";

const InputSchema = z.object({
  urls: z.array(z.string().url()).min(1),
  timeoutMs: z.number().int().positive().max(30000).optional(),
  concurrency: z.number().int().min(1).max(32).optional(),
});

type CheckResult = {
  url: string;
  status: number | null;
  ok: boolean;
  responseTimeMs: number | null;
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

async function testUrl(url: string, timeoutMs: number): Promise<CheckResult> {
  const start = Date.now();
  try {
    let response: Response;
    try {
      response = await fetchWithTimeout(
        url,
        { method: "HEAD", redirect: "follow" },
        timeoutMs,
      );
    } catch {
      response = await fetchWithTimeout(
        url,
        { method: "GET", redirect: "follow" },
        timeoutMs,
      );
    }
    const responseTimeMs = Date.now() - start;
    return {
      url,
      status: response.status,
      ok: response.ok,
      responseTimeMs,
    };
  } catch (error) {
    const responseTimeMs = Date.now() - start;
    return {
      url,
      status: null,
      ok: false,
      responseTimeMs,
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
    testUrl(url, timeoutMs),
  );

  return NextResponse.json({ results });
}
