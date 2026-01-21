import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDemoBySlug } from "@/lib/demos";

const ROOT = process.cwd();
const META_PATH = path.join(ROOT, "_demos", "hello-html", "meta.json");
const CONTENT_PATH = path.join(ROOT, "_demos", "hello-html", "index.html");

describe("demo: hello-html", () => {
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
    expect(meta.slug).toBe("hello-html");
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect(meta.type).toBe("html");
    expect(meta.ai.model).toBeTruthy();
    expect(meta.ai.agent).toBeTruthy();
    expect(meta.prompt.main).toBeTruthy();
    expect(meta.tags.length).toBeGreaterThan(0);
    expect(meta.createdAt).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("has html content file", async () => {
    const html = await fs.readFile(CONTENT_PATH, "utf8");
    expect(html.toLowerCase()).toContain("<!doctype html>");
  });

  it("route accessible via demo loader", async () => {
    const demo = await getDemoBySlug("hello-html", "en-US");
    expect(demo.entry).toBe("/index.html");
    expect(demo.code).toMatch(/<!doctype html>/i);
  });
});
