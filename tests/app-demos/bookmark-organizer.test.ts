import { promises as fs } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postAi } from "@/app/api/bookmarks/ai/route";
import { POST as postCheck } from "@/app/api/bookmarks/check/route";
import { POST as postMetadata } from "@/app/api/bookmarks/metadata/route";
import { GET as getReadme } from "@/app/api/bookmarks/readme/route";
import { getAllDemos } from "@/lib/demos";

vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      items: [
        {
          url: "https://example.com",
          suggestedTitle: "Example",
          suggestedFolder: "Tech/Docs",
          tags: ["docs", "ref"],
        },
      ],
    },
  }),
}));

vi.mock("@ai-sdk/deepseek", () => ({
  deepseek: vi.fn(() => ({ provider: "deepseek" })),
}));

const ROOT = process.cwd();
const META_PATH = path.join(
  ROOT,
  "src",
  "app",
  "demo",
  "bookmark-organizer",
  "meta.json",
);
const PAGE_PATH = path.join(
  ROOT,
  "src",
  "app",
  "demo",
  "bookmark-organizer",
  "page.tsx",
);

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe("app demo: bookmark-organizer", () => {
  it("validates meta.json", async () => {
    const raw = await fs.readFile(META_PATH, "utf8");
    const meta = JSON.parse(raw) as {
      id: string;
      slug: string;
      title: unknown;
      description: unknown;
      type: string;
      ai: { model: string; agent: string };
      prompt: { main: string };
      tags: string[];
      createdAt: string;
    };
    expect(meta.id).toBeTruthy();
    expect(meta.slug).toBe("bookmark-organizer");
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect(meta.type).toBe("react");
    expect(meta.ai.model).toBeTruthy();
    expect(meta.ai.agent).toBeTruthy();
    expect(meta.prompt.main).toBeTruthy();
    expect(meta.tags.length).toBeGreaterThan(0);
    expect(meta.createdAt).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("route is reachable via app demo list", async () => {
    const list = await getAllDemos({ locale: "en-US" });
    const demo = list.find((item) => item.slug === "bookmark-organizer");
    expect(demo).toBeDefined();
    if (!demo) throw new Error("missing app demo");
    expect(demo.route).toBe("/demo/bookmark-organizer");
    const pageContent = await fs.readFile(PAGE_PATH, "utf8");
    expect(pageContent).toMatch(/书签整理工具/);
  });

  it("readme API returns markdown", async () => {
    const response = await getReadme();
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toMatch(/Bookmark Organizer Demo/);
  });

  it("check API returns status results", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response("", { status: 200, statusText: "OK" }),
      ) as typeof fetch;

    const request = new Request("http://localhost/api/bookmarks/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: ["https://example.com"] }),
    });

    const response = await postCheck(request);
    const data = (await response.json()) as {
      results: Array<{ url: string; status: number | null }>;
    };
    expect(data.results.length).toBe(1);
    expect(data.results[0].status).toBe(200);
  });

  it("metadata API returns title and favicon", async () => {
    const html =
      '<html><head><title>Example</title><link rel="icon" href="/icon.png" /></head></html>';
    const response = new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
    Object.defineProperty(response, "url", {
      value: "https://example.com",
    });
    global.fetch = vi.fn().mockResolvedValue(response) as typeof fetch;

    const request = new Request("http://localhost/api/bookmarks/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: ["https://example.com"] }),
    });

    const result = await postMetadata(request);
    const data = (await result.json()) as {
      results: Array<{ url: string; title?: string; faviconUrl?: string }>;
    };
    expect(data.results[0].title).toBe("Example");
    expect(data.results[0].faviconUrl).toBe("https://example.com/icon.png");
  });

  it("ai API returns structured suggestions", async () => {
    process.env.DEEPSEEK_API_KEY = "test";
    const request = new Request("http://localhost/api/bookmarks/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookmarks: [
          {
            url: "https://example.com",
            title: "Example",
            folderPath: "Docs",
            tags: ["ref"],
          },
        ],
      }),
    });

    const result = await postAi(request);
    const data = (await result.json()) as {
      items: Array<{ url: string; suggestedTitle: string }>;
    };
    expect(data.items.length).toBe(1);
    expect(data.items[0].suggestedTitle).toBe("Example");
  });
});
