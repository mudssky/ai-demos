import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    "demo",
    "bookmark-organizer",
    "README.md",
  );
  const content = await fs.readFile(filePath, "utf8");
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
