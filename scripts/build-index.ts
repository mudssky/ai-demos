import { promises as fs } from "node:fs";
import path from "node:path";

type LocalizedText =
  | string
  | {
      en: string;
      zh?: string;
    };

type SearchIndexEntry = {
  slug: string;
  id: string;
  title: string;
  description: string;
  tags: string[];
  type: "html" | "react";
  ai: { model: string; agent: string };
  contentSnippet?: string;
  updatedAt?: string;
};

type SearchIndex = {
  version: string;
  generatedAt: string;
  entries: SearchIndexEntry[];
};

const ROOT = process.cwd();
const DEMOS_DIR = path.join(ROOT, "_demos");
const OUTPUT_FILE = path.join(ROOT, "public", "search-index.json");

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJSON<T>(filePath: string): Promise<T> {
  const buf = await fs.readFile(filePath, "utf8");
  return JSON.parse(buf) as T;
}

function asString(
  text: LocalizedText,
  locale: "en-US" | "zh-CN" = "en-US",
): string {
  if (typeof text === "string") return text;
  return locale === "zh-CN" ? (text.zh ?? text.en) : text.en;
}

async function listDemoDirs(): Promise<string[]> {
  const entries = await fs.readdir(DEMOS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(DEMOS_DIR, e.name));
}

async function readDemo(dirPath: string): Promise<{
  meta: any;
  code: string;
  entry: "/index.html" | "/App.tsx";
}> {
  const meta = await readJSON<any>(path.join(dirPath, "meta.json"));
  const htmlPath = path.join(dirPath, "index.html");
  const tsxPath = path.join(dirPath, "App.tsx");
  const hasHtml = await pathExists(htmlPath);
  const hasTsx = await pathExists(tsxPath);
  if (!hasHtml && !hasTsx) {
    throw new Error(`Demo content missing in ${dirPath}`);
  }
  const entry = hasHtml ? "/index.html" : "/App.tsx";
  const contentPath = hasHtml ? htmlPath : tsxPath;
  const code = await fs.readFile(contentPath, "utf8");
  return { meta, code, entry };
}

async function buildIndex(
  locale: "en-US" | "zh-CN" = "en-US",
  version = "1",
): Promise<SearchIndex> {
  const dirs = await listDemoDirs();
  const entries: SearchIndexEntry[] = [];
  for (const dir of dirs) {
    const { meta, code } = await readDemo(dir);
    const title = asString(meta.title as LocalizedText, locale);
    const description = meta.description
      ? asString(meta.description as LocalizedText, locale)
      : "";
    entries.push({
      slug: String(meta.slug),
      id: String(meta.id ?? meta.slug),
      title,
      description,
      tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
      type: meta.type as "html" | "react",
      ai: {
        model: String(meta.ai?.model ?? ""),
        agent: String(meta.ai?.agent ?? ""),
      },
      contentSnippet: typeof code === "string" ? code.slice(0, 240) : undefined,
      updatedAt:
        typeof meta.createdAt === "string" ? meta.createdAt : undefined,
    });
  }
  return {
    version,
    generatedAt: new Date().toISOString(),
    entries,
  };
}

async function writeIndex(): Promise<string> {
  const locale = (process.env.LOCALE as "en-US" | "zh-CN") || "en-US";
  const version = process.env.INDEX_VERSION || "1";
  const index = await buildIndex(locale, version);
  const json = JSON.stringify(index, null, 2);
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, json, "utf8");
  return OUTPUT_FILE;
}

writeIndex().catch((err) => {
  console.error(err);
  process.exit(1);
});
