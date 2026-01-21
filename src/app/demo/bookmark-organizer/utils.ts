import type { BookmarkEntry } from "@/lib/bookmark-storage";

export function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    const normalized = `${url.protocol}//${url.hostname}${url.pathname}`;
    return normalized.endsWith("/") && url.pathname !== "/"
      ? normalized.slice(0, -1)
      : normalized;
  } catch {
    return value.trim();
  }
}

export function mergeBookmarks(bookmarks: BookmarkEntry[]): BookmarkEntry[] {
  const map = new Map<string, BookmarkEntry>();
  for (const item of bookmarks) {
    const key = normalizeUrl(item.url);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item, url: key });
      continue;
    }
    const mergedTags = new Set([
      ...(existing.tags ?? []),
      ...(item.tags ?? []),
    ]);
    map.set(key, {
      ...existing,
      title: existing.title || item.title,
      folderPath: existing.folderPath || item.folderPath,
      tags: mergedTags.size ? Array.from(mergedTags) : existing.tags,
    });
  }
  return Array.from(map.values());
}

export function parseBookmarksFromHtml(html: string): BookmarkEntry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.querySelector("dl");
  if (!root) return [];
  const results: BookmarkEntry[] = [];

  const walk = (dl: Element, path: string[]) => {
    const children = Array.from(dl.children);
    for (const child of children) {
      if (child.tagName.toLowerCase() !== "dt") continue;
      const link = child.querySelector(":scope > a");
      const folder = child.querySelector(":scope > h3");

      if (link) {
        const href = link.getAttribute("href");
        if (!href) continue;
        results.push({
          id: "",
          url: href,
          title: link.textContent?.trim() || href,
          folderPath: path.length ? path.join("/") : undefined,
        });
      }

      if (folder) {
        const folderName = folder.textContent?.trim();
        const nestedDl =
          child.querySelector(":scope > dl") ??
          (child.nextElementSibling?.tagName.toLowerCase() === "dl"
            ? child.nextElementSibling
            : null);
        if (folderName && nestedDl) {
          walk(nestedDl, [...path, folderName]);
        }
      }
    }
  };

  walk(root, []);
  return results;
}

export function parseBookmarksFromJson(json: string): BookmarkEntry[] {
  const raw = JSON.parse(json);
  const list: Array<{ url: string; title?: string; folderPath?: string }> =
    Array.isArray(raw) ? raw : (raw?.bookmarks ?? []);
  return list
    .filter((item) => typeof item.url === "string")
    .map((item) => ({
      id: "",
      url: item.url,
      title: item.title?.trim() || item.url,
      folderPath: item.folderPath,
    }));
}

export function buildHtmlExport(bookmarks: BookmarkEntry[]) {
  const tree = new Map<string, BookmarkEntry[]>();
  for (const item of bookmarks) {
    const folder = item.folderPath ?? "";
    const list = tree.get(folder) ?? [];
    list.push(item);
    tree.set(folder, list);
    if (folder) {
      const parts = folder.split("/");
      let current = "";
      for (const part of parts.slice(0, -1)) {
        current = current ? `${current}/${part}` : part;
        if (!tree.has(current)) tree.set(current, []);
      }
    }
  }

  const renderFolder = (path: string): string => {
    const items = tree.get(path) ?? [];
    const folderHtml = items
      .map((item) => `<DT><A HREF="${item.url}">${item.title}</A></DT>`)
      .join("\n");
    const depth = path ? path.split("/").length : 0;
    const subfolders = Array.from(tree.keys())
      .filter((key) => key.startsWith(path) && key !== path)
      .filter((key) => key.split("/").length === depth + 1)
      .map((key) => {
        const name = key.split("/").pop() ?? key;
        return `\n<DT><H3>${name}</H3></DT>\n<DL><p>${renderFolder(
          key,
        )}</p></DL>`;
      })
      .join("\n");
    return `${folderHtml}${subfolders}`;
  };

  const body = renderFolder("");
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<DL><p>${body}</p></DL>`;
}

export function buildCsvReport(bookmarks: BookmarkEntry[]) {
  const header = ["url", "title", "status", "responseTimeMs"].join(",");
  const lines = bookmarks.map((item) =>
    [
      item.url,
      (item.title ?? "").replace(/"/g, ""),
      item.status ?? "",
      item.responseTimeMs ?? "",
    ]
      .map((value) => `"${value}"`)
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export function cloneBookmarks(list: BookmarkEntry[]): BookmarkEntry[] {
  return list.map((item) => ({
    ...item,
    tags: item.tags ? [...item.tags] : undefined,
    aiSuggestedTags: item.aiSuggestedTags
      ? [...item.aiSuggestedTags]
      : undefined,
  }));
}

export function matchesQuery(item: BookmarkEntry, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fields = [
    item.title,
    item.url,
    item.folderPath ?? "",
    ...(item.tags ?? []),
  ]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  return fields.some((value) => value.includes(q));
}
