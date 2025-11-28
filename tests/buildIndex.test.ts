import { describe, expect, it } from "vitest";
import { generateSearchIndex } from "@/lib/search/buildIndex";

describe("build index", () => {
  it("generates index from demos with content", async () => {
    const index = await generateSearchIndex("en-US", "1");
    expect(index.version).toBe("1");
    expect(Array.isArray(index.entries)).toBe(true);
    expect(index.entries.length).toBeGreaterThan(0);
    const first = index.entries[0];
    expect(first.slug).toBeTypeOf("string");
    expect(first.title).toBeTypeOf("string");
  });
});
