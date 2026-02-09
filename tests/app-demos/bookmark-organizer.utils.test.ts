// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  buildCsvReport,
  buildHtmlExport,
  cloneBookmarks,
  isDedupeStrategy,
  matchesQuery,
  mergeBookmarks,
  normalizeUrl,
  parseBookmarksFromHtml,
  parseBookmarksFromJson,
} from "@/app/demo/bookmark-organizer/utils";
import type { BookmarkEntry } from "@/lib/bookmark-storage";

describe("demo utils: bookmark-organizer", () => {
  it("normalizes URL in balanced mode by default", () => {
    expect(
      normalizeUrl(
        "https://example.com:443/path/?utm_source=test&id=2&gclid=abc&id=1#top",
      ),
    ).toBe("https://example.com/path?id=1&id=2");
  });

  it("normalizes URL in strict mode", () => {
    expect(
      normalizeUrl("https://example.com/path/?b=2&a=1#hash", "strict"),
    ).toBe("https://example.com/path/?b=2&a=1");
  });

  it("normalizes URL in aggressive mode", () => {
    expect(
      normalizeUrl(
        "https://example.com:8443/path/?id=2&utm_source=test#top",
        "aggressive",
      ),
    ).toBe("https://example.com/path");
  });

  it("validates dedupe strategy values", () => {
    expect(isDedupeStrategy("balanced")).toBe(true);
    expect(isDedupeStrategy("strict")).toBe(true);
    expect(isDedupeStrategy("aggressive")).toBe(true);
    expect(isDedupeStrategy("custom")).toBe(false);
    expect(isDedupeStrategy(undefined)).toBe(false);
  });

  it("keeps business query differences in balanced mode", () => {
    const input: BookmarkEntry[] = [
      { id: "1", url: "https://a.com/path?id=1", title: "A1" },
      { id: "2", url: "https://a.com/path?id=2", title: "A2" },
    ];
    const merged = mergeBookmarks(input, "balanced");
    expect(merged.length).toBe(2);
  });

  it("merges tracking-only differences in balanced mode", () => {
    const input: BookmarkEntry[] = [
      {
        id: "1",
        url: "https://a.com/path?utm_source=google&id=1",
        title: "A",
        tags: ["x"],
      },
      {
        id: "2",
        url: "https://a.com/path?utm_source=bing&id=1",
        title: "",
        tags: ["y"],
      },
    ];
    const merged = mergeBookmarks(input, "balanced");
    expect(merged.length).toBe(1);
    expect(merged[0].url).toBe("https://a.com/path?id=1");
    expect(merged[0].title).toBe("A");
    expect(merged[0].tags).toEqual(expect.arrayContaining(["x", "y"]));
  });

  it("keeps query order differences equivalent in balanced mode", () => {
    const input: BookmarkEntry[] = [
      { id: "1", url: "https://a.com/path?a=1&b=2", title: "A" },
      { id: "2", url: "https://a.com/path?b=2&a=1", title: "B" },
    ];
    const merged = mergeBookmarks(input, "balanced");
    expect(merged.length).toBe(1);
    expect(merged[0].url).toBe("https://a.com/path?a=1&b=2");
  });

  it("keeps tracking differences in strict mode", () => {
    const input: BookmarkEntry[] = [
      { id: "1", url: "https://a.com/path?utm_source=google", title: "A" },
      { id: "2", url: "https://a.com/path?utm_source=bing", title: "B" },
    ];
    const merged = mergeBookmarks(input, "strict");
    expect(merged.length).toBe(2);
  });

  it("merges duplicate bookmarks", () => {
    const input: BookmarkEntry[] = [
      { id: "1", url: "https://a.com", title: "A" },
      { id: "2", url: "https://a.com", title: "" },
    ];
    const merged = mergeBookmarks(input);
    expect(merged.length).toBe(1);
    expect(merged[0].title).toBe("A");
  });

  it("parses bookmarks from HTML", () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
      <DL><p>
      <DT><H3>Docs</H3></DT>
      <DL><p>
      <DT><A HREF="https://example.com">Example</A></DT>
      </p></DL>
      </p></DL>`;
    const list = parseBookmarksFromHtml(html);
    expect(list.length).toBe(1);
    expect(list[0].url).toBe("https://example.com");
    expect(list[0].folderPath).toBe("Docs");
  });

  it("parses bookmarks from JSON", () => {
    const json = JSON.stringify({
      bookmarks: [{ url: "https://example.com", title: "Example" }],
    });
    const list = parseBookmarksFromJson(json);
    expect(list.length).toBe(1);
    expect(list[0].title).toBe("Example");
  });

  it("builds HTML export", () => {
    const list: BookmarkEntry[] = [
      { id: "1", url: "https://example.com", title: "Example" },
    ];
    const html = buildHtmlExport(list);
    expect(html).toContain("NETSCAPE-Bookmark-file-1");
    expect(html).toContain("Example");
  });

  it("builds CSV report", () => {
    const list: BookmarkEntry[] = [
      {
        id: "1",
        url: "https://example.com",
        title: "Example",
        status: 200,
        responseTimeMs: 123,
      },
    ];
    const csv = buildCsvReport(list);
    expect(csv.split("\n").length).toBe(2);
    expect(csv).toContain("status");
  });

  it("clones bookmarks", () => {
    const list: BookmarkEntry[] = [
      { id: "1", url: "https://example.com", title: "Example", tags: ["a"] },
    ];
    const cloned = cloneBookmarks(list);
    expect(cloned).not.toBe(list);
    expect(cloned[0].tags).not.toBe(list[0].tags);
  });

  it("matches query against fields", () => {
    const item: BookmarkEntry = {
      id: "1",
      url: "https://example.com",
      title: "Example",
      folderPath: "Docs",
      tags: ["ref"],
    };
    expect(matchesQuery(item, "example")).toBe(true);
    expect(matchesQuery(item, "docs")).toBe(true);
    expect(matchesQuery(item, "missing")).toBe(false);
  });
});
