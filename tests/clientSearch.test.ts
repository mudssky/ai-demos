import { beforeEach, describe, expect, it } from "vitest";
import { search } from "@/lib/search/client";

const mockIndex = {
  version: "test",
  generatedAt: new Date().toISOString(),
  entries: [
    {
      slug: "hello-html",
      id: "1",
      title: "Hello HTML",
      description: "Simple demo",
      tags: ["html", "basic"],
      type: "html",
      ai: { model: "gpt-4o", agent: "cursor" },
      contentSnippet: "<html>Hello</html>",
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      slug: "hello-react",
      id: "2",
      title: "Hello React",
      description: "中文示例",
      tags: ["react", "tsx"],
      type: "react",
      ai: { model: "deepseek-v2", agent: "vscode" },
      contentSnippet: "export const x = 1;",
      updatedAt: new Date().toISOString(),
    },
  ],
};

beforeEach(() => {
  // mock fetch to return our index
  // @ts-expect-error global augmentation for test
  global.fetch = async () => ({
    ok: true,
    json: async () => mockIndex,
  });
});

describe("client search", () => {
  it("finds entries by English keyword and sorts by score", async () => {
    const { results, total } = await search("hello", 8);
    expect(total).toBe(2);
    expect(results[0].slug).toBe("hello-react"); // newer + match title
    expect(results[1].slug).toBe("hello-html");
  });

  it("matches Chinese tokens", async () => {
    const { results, total } = await search("示例", 8);
    expect(total).toBe(1);
    expect(results[0].slug).toBe("hello-react");
  });
});
