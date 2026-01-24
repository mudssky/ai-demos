import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEMOS_DIR = path.join(ROOT, "_demos");
const APP_DEMOS_DIR = path.join(ROOT, "src", "app", "demo");
const DEMO_TESTS_DIR = path.join(ROOT, "tests", "demos");
const APP_TESTS_DIR = path.join(ROOT, "tests", "app-demos");

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function demoTestTemplate({ slug, contentFile }) {
  const entryCheck =
    contentFile === "index.html"
      ? { entry: "/index.html", match: "<!doctype html" }
      : { entry: "/App.tsx", match: "export default function" };
  return `import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDemoBySlug } from "@/lib/demos";

const ROOT = process.cwd();
const META_PATH = path.join(ROOT, "_demos", "${slug}", "meta.json");
const CONTENT_PATH = path.join(ROOT, "_demos", "${slug}", "${contentFile}");

describe("demo: ${slug}", () => {
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
    expect(meta.slug).toBe("${slug}");
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect(meta.type).toBeTruthy();
    expect(meta.ai.model).toBeTruthy();
    expect(meta.ai.agent).toBeTruthy();
    expect(meta.prompt.main).toBeTruthy();
    expect(meta.tags.length).toBeGreaterThan(0);
    expect(meta.createdAt).toMatch(/\\d{4}-\\d{2}-\\d{2}/);
  });

  it("has content file", async () => {
    const content = await fs.readFile(CONTENT_PATH, "utf8");
    expect(content.toLowerCase()).toContain("${entryCheck.match}");
  });

  it("route accessible via demo loader", async () => {
    const demo = await getDemoBySlug("${slug}", "en-US");
    expect(demo.entry).toBe("${entryCheck.entry}");
    expect(demo.code.toLowerCase()).toContain("${entryCheck.match}");
  });
});
`;
}

function appDemoTestTemplate({ slug }) {
  return `import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllDemos } from "@/lib/demos";

const ROOT = process.cwd();
const META_PATH = path.join(
  ROOT,
  "src",
  "app",
  "demo",
  "${slug}",
  "meta.json",
);
const PAGE_PATH = path.join(
  ROOT,
  "src",
  "app",
  "demo",
  "${slug}",
  "page.tsx",
);

describe("app demo: ${slug}", () => {
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
    expect(meta.slug).toBe("${slug}");
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect(meta.type).toBeTruthy();
    expect(meta.ai.model).toBeTruthy();
    expect(meta.ai.agent).toBeTruthy();
    expect(meta.prompt.main).toBeTruthy();
    expect(meta.tags.length).toBeGreaterThan(0);
    expect(meta.createdAt).toMatch(/\\d{4}-\\d{2}-\\d{2}/);
  });

  it("route is reachable via app demo list", async () => {
    const list = await getAllDemos({ locale: "en-US" });
    const demo = list.find((item) => item.slug === "${slug}");
    expect(demo).toBeDefined();
    if (!demo) throw new Error("missing app demo");
    expect(demo.route).toBe("/demo/${slug}");
    const pageContent = await fs.readFile(PAGE_PATH, "utf8");
    expect(pageContent).toMatch(/${slug.replace(/-/g, " ")}/i);
  });

  it("API endpoints respond (TODO)", async () => {
    // TODO: import and call API route handlers from src/app/api for this demo.
    expect(true).toBe(true);
  });
});
`;
}

function appDemoUtilsTemplate({ slug }) {
  return `// @vitest-environment jsdom\n\nimport { describe, expect, it } from "vitest";\n\n// TODO: import utils from @/app/demo/${slug}/utils and add unit tests.\n\ndescribe("app demo utils: ${slug}", () => {\n  it("placeholder", () => {\n    expect(true).toBe(true);\n  });\n});\n`;
}

async function generateDemos() {
  await ensureDir(DEMO_TESTS_DIR);
  const entries = await fs.readdir(DEMOS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const demoDir = path.join(DEMOS_DIR, entry.name);
    const metaPath = path.join(demoDir, "meta.json");
    if (!(await pathExists(metaPath))) continue;
    const htmlPath = path.join(demoDir, "index.html");
    const _tsxPath = path.join(demoDir, "App.tsx");
    const contentFile = (await pathExists(htmlPath)) ? "index.html" : "App.tsx";
    const testPath = path.join(DEMO_TESTS_DIR, `${entry.name}.test.ts`);
    if (await pathExists(testPath)) continue;
    await fs.writeFile(
      testPath,
      demoTestTemplate({ slug: entry.name, contentFile }),
      "utf8",
    );
    process.stdout.write(`created ${path.relative(ROOT, testPath)}\n`);
  }
}

async function generateAppDemos() {
  await ensureDir(APP_TESTS_DIR);
  if (!(await pathExists(APP_DEMOS_DIR))) return;
  const entries = await fs.readdir(APP_DEMOS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const demoDir = path.join(APP_DEMOS_DIR, entry.name);
    const metaPath = path.join(demoDir, "meta.json");
    if (!(await pathExists(metaPath))) continue;
    const testPath = path.join(APP_TESTS_DIR, `${entry.name}.test.ts`);
    if (!(await pathExists(testPath))) {
      await fs.writeFile(
        testPath,
        appDemoTestTemplate({ slug: entry.name }),
        "utf8",
      );
      process.stdout.write(`created ${path.relative(ROOT, testPath)}\n`);
    }
    const utilsPath = path.join(demoDir, "utils.ts");
    if (await pathExists(utilsPath)) {
      const utilsTestPath = path.join(
        APP_TESTS_DIR,
        `${entry.name}.utils.test.ts`,
      );
      if (!(await pathExists(utilsTestPath))) {
        await fs.writeFile(
          utilsTestPath,
          appDemoUtilsTemplate({ slug: entry.name }),
          "utf8",
        );
        process.stdout.write(`created ${path.relative(ROOT, utilsTestPath)}\n`);
      }
    }
  }
}

await generateDemos();
await generateAppDemos();
