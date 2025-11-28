import { describe, expect, it } from "vitest";
import {
  buildSearchIndex,
  filterDemos,
  getAllDemos,
  getDemoBySlug,
} from "@/lib/demos";

describe("demos data layer", () => {
  it("reads all demos summary (en)", async () => {
    const list = await getAllDemos({ withContent: false, locale: "en" });
    const slugs = list.map((d) => d.slug);
    expect(slugs).toContain("hello-html");
    expect(slugs).toContain("hello-react");
    const html = list.find((d) => d.slug === "hello-html");
    expect(html).toBeDefined();
    if (!html) throw new Error("missing hello-html");
    expect(html.title).toBe("Hello HTML");
    const react = list.find((d) => d.slug === "hello-react");
    expect(react).toBeDefined();
    if (!react) throw new Error("missing hello-react");
    expect(react.title).toBe("Hello React");
  });

  it("localizes to zh with fallback", async () => {
    const list = await getAllDemos({ withContent: false, locale: "zh" });
    const html = list.find((d) => d.slug === "hello-html");
    expect(html).toBeDefined();
    if (!html) throw new Error("missing hello-html");
    expect(html.title).toBe("HTML 入门示例");
    const react = list.find((d) => d.slug === "hello-react");
    expect(react).toBeDefined();
    if (!react) throw new Error("missing hello-react");
    // react zh missing, should fallback to en
    expect(react.title).toBe("Hello React");
  });

  it("gets demo by slug with content and entry", async () => {
    const html = await getDemoBySlug("hello-html", "en");
    expect(html.entry).toBe("/index.html");
    expect(html.code).toMatch("<!doctype html>");
    const react = await getDemoBySlug("hello-react", "en");
    expect(react.entry).toBe("/App.tsx");
    expect(react.code).toMatch("export default function App");
  });

  it("filters by type and model", async () => {
    const list = await getAllDemos({ withContent: false, locale: "en" });
    const htmlOnly = filterDemos(list, { type: "html" });
    expect(htmlOnly.length).toBe(1);
    expect(htmlOnly[0].slug).toBe("hello-html");
    const deepseek = filterDemos(list, { model: "deepseek-v2" });
    expect(deepseek.length).toBe(1);
    expect(deepseek[0].slug).toBe("hello-react");
  });

  it("query filters across fields", async () => {
    const list = await getAllDemos({ withContent: false, locale: "en" });
    const q1 = filterDemos(list, { query: "tsx" });
    expect(q1.map((d) => d.slug)).toEqual(["hello-react"]);
    const q2 = filterDemos(list, { query: "basic" });
    expect(q2.map((d) => d.slug)).toEqual(["hello-html"]);
  });

  it("builds search index including snippet", async () => {
    const list = await getAllDemos({ withContent: true, locale: "en" });
    const index = buildSearchIndex(list, "1");
    expect(index.version).toBe("1");
    expect(index.entries.length).toBeGreaterThanOrEqual(2);
    const e = index.entries.find((x) => x.slug === "hello-react");
    expect(e).toBeDefined();
    if (!e) throw new Error("missing index entry");
    expect(e.contentSnippet).toBeDefined();
  });
});
