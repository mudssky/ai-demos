// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  buildCsvReport,
  buildHtmlExport,
  cloneBookmarks,
  matchesQuery,
  mergeBookmarks,
  normalizeUrl,
  parseBookmarksFromHtml,
  parseBookmarksFromJson,
} from "@/app/demo/bookmark-organizer/utils";
import type { BookmarkEntry } from "@/lib/bookmark-storage";

describe("demo utils: bookmark-organizer", () => {
  it("normalizes URLs", () => {
    expect(normalizeUrl("https://example.com/path/")).toBe(
      "https://example.com/path",
    );
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
