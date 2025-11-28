import { promises as fs } from "node:fs";
import path from "node:path";
import { buildSearchIndex, getAllDemos } from "@/lib/demos";
import type { Locale, SearchIndex } from "@/lib/types";

const OUTPUT_FILE = path.join(process.cwd(), "public", "search-index.json");

export async function generateSearchIndex(
  locale: Locale = "en-US",
  version = "1",
): Promise<SearchIndex> {
  const list = await getAllDemos({ withContent: true, locale });
  return buildSearchIndex(list, version);
}

export async function writeSearchIndex(
  locale: Locale = "en-US",
  version = "1",
  outFile: string = OUTPUT_FILE,
): Promise<string> {
  const index = await generateSearchIndex(locale, version);
  const json = JSON.stringify(index, null, 2);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, json, "utf8");
  return outFile;
}

export default writeSearchIndex;
