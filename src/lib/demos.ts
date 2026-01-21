import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AIAgent,
  AIModel,
  Demo,
  DemoMeta,
  DemoSummary,
  FilterCriteria,
  GetAllDemosOptions,
  Locale,
  LocalizedText,
  SearchIndex,
  SearchIndexEntry,
} from "./types";

const DEMOS_DIR = "_demos";
const APP_DEMOS_DIR = path.join("src", "app", "demo");

function resolveDemoRoot(): string {
  return path.join(process.cwd(), DEMOS_DIR);
}

function asString(text: LocalizedText, locale: Locale = "en-US"): string {
  if (typeof text === "string") return text;
  return locale === "zh-CN" ? (text.zh ?? text.en) : text.en;
}

async function readJSON<T>(filePath: string): Promise<T> {
  const buf = await fs.readFile(filePath, "utf8");
  return JSON.parse(buf) as T;
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readDemoDir(dirPath: string): Promise<{
  meta: DemoMeta;
  content: { code: string; entry: "/index.html" | "/App.tsx" };
}> {
  const meta = await readJSON<DemoMeta>(path.join(dirPath, "meta.json"));
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
  return { meta, content: { code, entry } };
}

async function listDemoDirs(): Promise<string[]> {
  const root = resolveDemoRoot();
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(root, e.name));
}

async function listAppDemoMetaFiles(): Promise<string[]> {
  const root = path.join(process.cwd(), APP_DEMOS_DIR);
  if (!(await pathExists(root))) return [];
  const results: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name === "meta.json") {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function toSummary(meta: DemoMeta, locale: Locale = "en-US"): DemoSummary {
  return {
    slug: meta.slug,
    title: asString(meta.title, locale),
    description: meta.description
      ? asString(meta.description, locale)
      : undefined,
    type: meta.type,
    tags: meta.tags,
    ai: { model: meta.ai.model, agent: meta.ai.agent },
    createdAt: meta.createdAt,
  };
}

export async function getDemoBySlug(
  slug: string,
  locale: Locale = "en-US",
): Promise<Demo> {
  const dirs = await listDemoDirs();
  for (const dir of dirs) {
    const metaPath = path.join(dir, "meta.json");
    const meta = await readJSON<DemoMeta>(metaPath);
    if (meta.slug === slug) {
      const { content } = await readDemoDir(dir);
      return {
        ...meta,
        title: asString(meta.title, locale),
        description: asString(meta.description, locale),
        code: content.code,
        entry: content.entry,
      };
    }
  }
  throw Object.assign(new Error(`Demo not found: ${slug}`), {
    statusCode: 404,
  });
}

export async function getAllDemos(
  options?: GetAllDemosOptions & { withContent?: false },
): Promise<DemoSummary[]>;
export async function getAllDemos(
  options: GetAllDemosOptions & { withContent: true },
): Promise<Demo[]>;
export async function getAllDemos(
  options?: GetAllDemosOptions,
): Promise<Array<Demo | DemoSummary>> {
  const locale = options?.locale ?? "en-US";
  const withContent = options?.withContent === true;
  const includeAppDemos = options?.includeAppDemos !== false;
  const dirs = await listDemoDirs();
  const items: Array<Demo | DemoSummary> = [];
  for (const dir of dirs) {
    const { meta, content } = await readDemoDir(dir);
    if (withContent) {
      const demo: Demo = {
        ...meta,
        title: asString(meta.title, locale),
        description: asString(meta.description, locale),
        code: content.code,
        entry: content.entry,
      };
      items.push(demo);
    } else {
      items.push(toSummary(meta, locale));
    }
  }
  if (!withContent && includeAppDemos) {
    const appMetaFiles = await listAppDemoMetaFiles();
    for (const metaPath of appMetaFiles) {
      const meta = await readJSON<DemoMeta>(metaPath);
      items.push({
        ...toSummary(meta, locale),
        route: `/demo/${meta.slug}`,
      });
    }
  }
  return items;
}

export function filterDemos<T extends DemoSummary>(
  list: T[],
  criteria: FilterCriteria,
): T[] {
  let result = list.slice();
  if (criteria.type) {
    result = result.filter((d) => d.type === criteria.type);
  }
  if (criteria.model) {
    const m: AIModel = criteria.model;
    result = result.filter((d) => d.ai.model === m);
  }
  if (criteria.agent) {
    const a: AIAgent = criteria.agent;
    result = result.filter((d) => d.ai.agent === a);
  }
  if (criteria.tags && criteria.tags.length > 0) {
    const set = new Set(criteria.tags.map((t) => t.toLowerCase()));
    result = result.filter((d) => d.tags.some((t) => set.has(t.toLowerCase())));
  }
  if (criteria.query && criteria.query.trim().length > 0) {
    const q = criteria.query.trim().toLowerCase();
    result = result.filter((d) => {
      const fields = [
        d.slug,
        d.title,
        d.description ?? "",
        d.ai.model,
        d.ai.agent,
        ...d.tags,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }
  return result;
}

export function buildSearchIndex(
  list: Array<Demo | DemoSummary>,
  version = "1",
): SearchIndex {
  const entries: SearchIndexEntry[] = list.map((item) => {
    const title =
      typeof item.title === "string" ? item.title : asString(item.title);
    const description =
      "description" in item && item.description
        ? typeof item.description === "string"
          ? item.description
          : asString(item.description)
        : "";
    const base = {
      slug: item.slug,
      id: "id" in item ? item.id : item.slug,
      title,
      description,
      tags: item.tags,
      type: item.type,
      ai: { model: item.ai.model, agent: item.ai.agent },
    } satisfies Omit<SearchIndexEntry, "contentSnippet" | "updatedAt">;
    const contentSnippet = "code" in item ? item.code.slice(0, 240) : undefined;
    return { ...base, contentSnippet };
  });
  return {
    version,
    generatedAt: new Date().toISOString(),
    entries,
  };
}
