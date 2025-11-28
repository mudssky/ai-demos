import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEMOS_DIR = path.join(ROOT, "_demos");
const OUTPUT_FILE = path.join(ROOT, "public", "search-index.json");

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(filePath) {
  const buf = await fs.readFile(filePath, "utf8");
  return JSON.parse(buf);
}

function asString(text, locale = "en-US") {
  if (typeof text === "string") return text;
  if (locale === "zh-CN") return text.zh ?? text.en;
  return text.en;
}

async function listDemoDirs() {
  const entries = await fs.readdir(DEMOS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(DEMOS_DIR, e.name));
}

async function readDemo(dirPath) {
  const meta = await readJSON(path.join(dirPath, "meta.json"));
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

async function buildIndex(locale = "en-US", version = "1") {
  const dirs = await listDemoDirs();
  const entries = [];
  for (const dir of dirs) {
    const { meta, code } = await readDemo(dir);
    const title = asString(meta.title, locale);
    const description = meta.description
      ? asString(meta.description, locale)
      : "";
    entries.push({
      slug: meta.slug,
      id: meta.id ?? meta.slug,
      title,
      description,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      type: meta.type,
      ai: { model: meta.ai.model, agent: meta.ai.agent },
      contentSnippet: typeof code === "string" ? code.slice(0, 240) : undefined,
      updatedAt: meta.createdAt,
    });
  }
  return {
    version,
    generatedAt: new Date().toISOString(),
    entries,
  };
}

async function writeIndex() {
  const index = await buildIndex(
    process.env.LOCALE || "en-US",
    process.env.INDEX_VERSION || "1",
  );
  const json = JSON.stringify(index, null, 2);
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, json, "utf8");
  return OUTPUT_FILE;
}

writeIndex().catch((err) => {
  console.error(err);
  process.exit(1);
});
