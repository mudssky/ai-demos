import type { BookmarkEntry } from "@/lib/bookmark-storage";

export type DedupeStrategy = "strict" | "balanced" | "aggressive";

const TRACKING_PARAM_NAMES = new Set([
  "fbclid",
  "gclid",
  "msclkid",
  "igshid",
  "mc_cid",
  "mc_eid",
]);

/**
 * 判断给定值是否为合法的去重策略。
 * @param value 待校验的策略字符串。
 * @returns 当值属于 strict/balanced/aggressive 时返回 true。
 */
export function isDedupeStrategy(
  value: string | null | undefined,
): value is DedupeStrategy {
  return value === "strict" || value === "balanced" || value === "aggressive";
}

/**
 * 判断查询参数是否属于追踪参数。
 * @param key 查询参数键名。
 * @returns 若为追踪参数返回 true，否则返回 false。
 */
function isTrackingParam(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return lowerKey.startsWith("utm_") || TRACKING_PARAM_NAMES.has(lowerKey);
}

/**
 * 归一化 URL 端口，默认端口会被移除以降低无意义差异。
 * @param url URL 对象。
 * @returns 归一化后的端口字符串，空字符串表示不显式输出端口。
 */
function normalizePort(url: URL): string {
  if (
    (url.protocol === "https:" && url.port === "443") ||
    (url.protocol === "http:" && url.port === "80")
  ) {
    return "";
  }
  return url.port;
}

/**
 * 依据策略归一化路径。
 * @param pathname 原始路径。
 * @param strategy 去重策略。
 * @returns 归一化后的路径。
 */
function normalizePathname(pathname: string, strategy: DedupeStrategy): string {
  if (!pathname) return "/";
  if (strategy === "strict") return pathname;
  return pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;
}

/**
 * 按 balanced 策略归一化查询参数。
 * @param url URL 对象。
 * @returns 归一化后的查询字符串（包含前导 ?，若为空则返回空字符串）。
 */
function buildBalancedSearch(url: URL): string {
  const entries = [...url.searchParams.entries()]
    .filter(([key]) => !isTrackingParam(key))
    .sort(([aKey, aValue], [bKey, bValue]) => {
      if (aKey === bKey) return aValue.localeCompare(bValue);
      return aKey.localeCompare(bKey);
    });

  if (entries.length === 0) return "";

  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    params.append(key, value);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * 按指定策略将 URL 归一化为可用于去重的键。
 * @param value 原始 URL 字符串。
 * @param strategy 去重策略，默认 balanced。
 * @returns 归一化后的 URL。解析失败时返回去除两端空白后的原值。
 */
export function normalizeUrl(
  value: string,
  strategy: DedupeStrategy = "balanced",
): string {
  try {
    const url = new URL(value);
    const pathname = normalizePathname(url.pathname, strategy);
    const port = strategy === "aggressive" ? "" : normalizePort(url);
    const search =
      strategy === "strict"
        ? url.search
        : strategy === "balanced"
          ? buildBalancedSearch(url)
          : "";

    return `${url.protocol}//${url.hostname}${port ? `:${port}` : ""}${pathname}${search}`;
  } catch {
    return value.trim();
  }
}

/**
 * 按去重策略合并书签列表。
 * @param bookmarks 原始书签列表。
 * @param strategy 去重策略，默认 balanced。
 * @returns 合并后的书签列表。
 */
export function mergeBookmarks(
  bookmarks: BookmarkEntry[],
  strategy: DedupeStrategy = "balanced",
): BookmarkEntry[] {
  const map = new Map<string, BookmarkEntry>();
  for (const item of bookmarks) {
    const key = normalizeUrl(item.url, strategy);
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
      tags: mergedTags.size > 0 ? Array.from(mergedTags) : existing.tags,
    });
  }
  return Array.from(map.values());
}

/**
 * 从 Chrome 书签 HTML 中解析书签条目。
 * @param html HTML 文本内容。
 * @returns 解析后的书签列表。
 */
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

/**
 * 从 JSON 中解析书签条目。
 * @param json JSON 文本。
 * @returns 解析后的书签列表。
 */
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

/**
 * 构建可供 Chrome 导入的书签 HTML。
 * @param bookmarks 书签列表。
 * @returns 导出的 HTML 字符串。
 */
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

/**
 * 构建书签检测报告 CSV。
 * @param bookmarks 书签列表。
 * @returns CSV 文本。
 */
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

/**
 * 深拷贝书签数组中与编辑相关的字段，避免原地修改影响撤销栈。
 * @param list 原始书签列表。
 * @returns 可安全编辑的新列表。
 */
export function cloneBookmarks(list: BookmarkEntry[]): BookmarkEntry[] {
  return list.map((item) => ({
    ...item,
    tags: item.tags ? [...item.tags] : undefined,
    aiSuggestedTags: item.aiSuggestedTags
      ? [...item.aiSuggestedTags]
      : undefined,
  }));
}

/**
 * 判断书签是否匹配搜索词。
 * @param item 书签条目。
 * @param query 用户输入的搜索词。
 * @returns 匹配返回 true，否则返回 false。
 */
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
