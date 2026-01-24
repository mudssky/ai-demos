"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ReadmeDialog from "@/components/ReadmeDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type BookmarkEntry,
  type BookmarkOrganizerState,
  type BookmarkSettings,
  loadBookmarkState,
  saveBookmarkState,
} from "@/lib/bookmark-storage";
import {
  buildCsvReport,
  buildHtmlExport,
  cloneBookmarks,
  matchesQuery,
  mergeBookmarks,
  parseBookmarksFromHtml,
  parseBookmarksFromJson,
} from "./utils";

const DEFAULT_SETTINGS: BookmarkSettings = { concurrency: 8 };
const MAX_CONCURRENCY = 32;
const MAX_HISTORY = 10;

function clampConcurrency(value: number) {
  return Math.min(MAX_CONCURRENCY, Math.max(1, value));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function withIds(list: BookmarkEntry[]): BookmarkEntry[] {
  return list.map((item) => ({ ...item, id: createId() }));
}

export default function BookmarkOrganizerDemo() {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [settings, setSettings] = useState<BookmarkSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkFolder, setBulkFolder] = useState("");
  const [bulkTags, setBulkTags] = useState("");
  const [appendTagsOnly, setAppendTagsOnly] = useState(true);
  const [tagRemoveInput, setTagRemoveInput] = useState("");
  const [tagMergeSource, setTagMergeSource] = useState("");
  const [tagMergeTarget, setTagMergeTarget] = useState("");
  const [bulkPreview, setBulkPreview] = useState<string | null>(null);
  const [bulkPreviewItems, setBulkPreviewItems] = useState<
    Array<{ id: string; title: string; changes: string[] }>
  >([]);
  const [mergeSelectedTarget, setMergeSelectedTarget] = useState("");
  const [history, setHistory] = useState<BookmarkEntry[][]>([]);
  const hydratedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    loadBookmarkState()
      .then((stored) => {
        if (!mounted || !stored) return;
        setBookmarks(stored.bookmarks ?? []);
        const storedConcurrency =
          stored.settings?.concurrency ?? DEFAULT_SETTINGS.concurrency;
        setSettings({ concurrency: clampConcurrency(storedConcurrency) });
      })
      .finally(() => {
        if (mounted) hydratedRef.current = true;
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const payload: BookmarkOrganizerState = { bookmarks, settings };
    saveBookmarkState(payload).catch(() => null);
  }, [bookmarks, settings]);

  const invalidBookmarks = useMemo(
    () =>
      bookmarks.filter(
        (item) => item.status === null || (item.status ?? 0) >= 400,
      ),
    [bookmarks],
  );

  const tagStats = useMemo(() => {
    const stats = new Map<string, number>();
    for (const item of bookmarks) {
      for (const tag of item.tags ?? []) {
        stats.set(tag, (stats.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(stats.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((item) => {
      if (!matchesQuery(item, query)) return false;
      if (activeTag && !(item.tags ?? []).includes(activeTag)) return false;
      return true;
    });
  }, [bookmarks, query, activeTag]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allFilteredSelected =
    filteredBookmarks.length > 0 &&
    filteredBookmarks.every((item) => selectedSet.has(item.id));

  const selectedTagStats = useMemo(() => {
    const stats = new Map<string, number>();
    for (const item of bookmarks) {
      if (!selectedSet.has(item.id)) continue;
      for (const tag of item.tags ?? []) {
        stats.set(tag, (stats.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(stats.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [bookmarks, selectedSet]);

  const handleImport = async (file: File) => {
    setError(null);
    const text = await file.text();
    try {
      const imported = withIds(
        file.name.endsWith(".html")
          ? parseBookmarksFromHtml(text)
          : parseBookmarksFromJson(text),
      );
      const merged = mergeBookmarks([...bookmarks, ...imported]);
      setBookmarks(merged);
      setStatus(`导入 ${imported.length} 条书签，合并后共 ${merged.length} 条`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    }
  };

  const handleExportHtml = () => {
    const content = buildHtmlExport(bookmarks);
    downloadFile(content, "bookmarks.html", "text/html");
  };

  const handleExportJson = () => {
    const payload = { bookmarks };
    downloadFile(
      JSON.stringify(payload, null, 2),
      "bookmarks.json",
      "application/json",
    );
  };

  const handleRunCheck = async () => {
    setError(null);
    if (bookmarks.length === 0) {
      setStatus("暂无书签可检测");
      return;
    }
    setStatus("正在检测可达性...");
    const response = await fetch("/api/bookmarks/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: bookmarks.map((item) => item.url),
        concurrency: settings.concurrency,
      }),
    });
    if (!response.ok) {
      setError("检测失败");
      setStatus(null);
      return;
    }
    const data = (await response.json()) as {
      results: Array<{
        url: string;
        status: number | null;
        ok: boolean;
        responseTimeMs: number | null;
      }>;
    };
    setBookmarks((prev) =>
      prev.map((item) => {
        const result = data.results.find((r) => r.url === item.url);
        if (!result) return item;
        return {
          ...item,
          status: result.status ?? undefined,
          responseTimeMs: result.responseTimeMs ?? undefined,
          lastCheckedAt: new Date().toISOString(),
        };
      }),
    );
    setStatus("检测完成");
  };

  const handleFetchMetadata = async () => {
    setError(null);
    if (bookmarks.length === 0) {
      setStatus("暂无书签可抓取");
      return;
    }
    setStatus("正在抓取标题与图标...");
    const response = await fetch("/api/bookmarks/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: bookmarks.map((item) => item.url),
        concurrency: settings.concurrency,
      }),
    });
    if (!response.ok) {
      setError("抓取失败");
      setStatus(null);
      return;
    }
    const data = (await response.json()) as {
      results: Array<{
        url: string;
        title?: string;
        faviconUrl?: string;
      }>;
    };
    setBookmarks((prev) =>
      prev.map((item) => {
        const result = data.results.find((r) => r.url === item.url);
        if (!result) return item;
        return {
          ...item,
          title: result.title ?? item.title,
          faviconUrl: result.faviconUrl ?? item.faviconUrl,
        };
      }),
    );
    setStatus("抓取完成");
  };

  const handleRunAi = async () => {
    setError(null);
    if (bookmarks.length === 0) {
      setStatus("暂无书签可整理");
      return;
    }
    setStatus("AI 正在整理书签...");
    const response = await fetch("/api/bookmarks/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookmarks: bookmarks.map((item) => ({
          url: item.url,
          title: item.title,
          folderPath: item.folderPath,
          tags: item.tags,
        })),
      }),
    });
    if (!response.ok) {
      setError("AI 整理失败");
      setStatus(null);
      return;
    }
    const data = (await response.json()) as {
      items: Array<{
        url: string;
        suggestedTitle: string;
        suggestedFolder: string;
        tags: string[];
      }>;
    };
    setBookmarks((prev) =>
      prev.map((item) => {
        const result = data.items.find((r) => r.url === item.url);
        if (!result) return item;
        return {
          ...item,
          aiSuggestedTitle: result.suggestedTitle,
          aiSuggestedFolder: result.suggestedFolder,
          aiSuggestedTags: result.tags,
        };
      }),
    );
    setStatus("AI 整理完成，可批量应用");
  };

  const handleApplyAi = () => {
    setBookmarks((prev) =>
      prev.map((item) => ({
        ...item,
        title: item.aiSuggestedTitle ?? item.title,
        folderPath: item.aiSuggestedFolder ?? item.folderPath,
        tags: item.aiSuggestedTags ?? item.tags,
      })),
    );
  };

  const handleRemoveInvalid = () => {
    setBookmarks((prev) =>
      prev.filter(
        (item) => !(item.status === null || (item.status ?? 0) >= 400),
      ),
    );
  };

  const handleExportReportJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      items: bookmarks.map((item) => ({
        url: item.url,
        title: item.title,
        status: item.status ?? null,
        responseTimeMs: item.responseTimeMs ?? null,
      })),
    };
    downloadFile(
      JSON.stringify(payload, null, 2),
      "report.json",
      "application/json",
    );
  };

  const handleExportReportCsv = () => {
    downloadFile(buildCsvReport(bookmarks), "report.csv", "text/csv");
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredBookmarks.some((item) => item.id === id)),
      );
      return;
    }
    const merged = new Set([
      ...selectedIds,
      ...filteredBookmarks.map((b) => b.id),
    ]);
    setSelectedIds(Array.from(merged));
  };

  const handleBulkApply = () => {
    if (selectedIds.length === 0) {
      setStatus("未选择任何书签");
      return;
    }
    const nextTags = bulkTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setBookmarks((prev) => {
      setHistory((entries) =>
        [...entries, cloneBookmarks(prev)].slice(-MAX_HISTORY),
      );
      return prev.map((item) => {
        if (!selectedSet.has(item.id)) return item;
        const mergedTags = appendTagsOnly
          ? Array.from(new Set([...(item.tags ?? []), ...nextTags]))
          : nextTags.length > 0
            ? nextTags
            : item.tags;
        return {
          ...item,
          title: bulkTitle.trim() ? bulkTitle.trim() : item.title,
          folderPath: bulkFolder.trim() ? bulkFolder.trim() : item.folderPath,
          tags: nextTags.length > 0 ? mergedTags : item.tags,
        };
      });
    });
    setBulkPreview(null);
    setBulkPreviewItems([]);
    setStatus("批量编辑已应用");
  };

  const handleApplyTagToSelected = (tag: string) => {
    if (selectedIds.length === 0) {
      setStatus("请先选择书签");
      return;
    }
    setHistory((entries) =>
      [...entries, cloneBookmarks(bookmarks)].slice(-MAX_HISTORY),
    );
    setBookmarks((prev) =>
      prev.map((item) => {
        if (!selectedSet.has(item.id)) return item;
        const next = new Set([...(item.tags ?? []), tag]);
        return { ...item, tags: Array.from(next) };
      }),
    );
    setStatus(`已应用标签：${tag}`);
  };

  const handleRemoveTags = () => {
    if (selectedIds.length === 0) {
      setStatus("请先选择书签");
      return;
    }
    const targets = tagRemoveInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (targets.length === 0) {
      setStatus("请输入要移除的标签");
      return;
    }
    setHistory((entries) =>
      [...entries, cloneBookmarks(bookmarks)].slice(-MAX_HISTORY),
    );
    setBookmarks((prev) =>
      prev.map((item) => {
        if (!selectedSet.has(item.id)) return item;
        const next = (item.tags ?? []).filter((tag) => !targets.includes(tag));
        return { ...item, tags: next };
      }),
    );
    setStatus("已从选中项移除标签");
  };

  const handleMergeTags = () => {
    if (selectedIds.length === 0) {
      setStatus("请先选择书签");
      return;
    }
    const sources = tagMergeSource
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const target = tagMergeTarget.trim();
    if (sources.length === 0 || !target) {
      setStatus("请输入来源标签与目标标签");
      return;
    }
    setHistory((entries) =>
      [...entries, cloneBookmarks(bookmarks)].slice(-MAX_HISTORY),
    );
    setBookmarks((prev) =>
      prev.map((item) => {
        if (!selectedSet.has(item.id)) return item;
        const current = new Set(item.tags ?? []);
        let changed = false;
        for (const tag of sources) {
          if (current.delete(tag)) {
            changed = true;
          }
        }
        if (changed) {
          current.add(target);
        }
        return { ...item, tags: Array.from(current) };
      }),
    );
    setStatus("标签合并完成");
  };

  const handlePreviewBulk = () => {
    if (selectedIds.length === 0) {
      setStatus("未选择任何书签");
      return;
    }
    const nextTags = bulkTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const summary = [
      `选中 ${selectedIds.length} 项`,
      bulkTitle.trim() ? `标题→${bulkTitle.trim()}` : null,
      bulkFolder.trim() ? `目录→${bulkFolder.trim()}` : null,
      nextTags.length > 0
        ? appendTagsOnly
          ? `追加标签→${nextTags.join("/")}`
          : `覆盖标签→${nextTags.join("/")}`
        : null,
    ]
      .filter(Boolean)
      .join("，");
    setBulkPreview(summary || "无变更");
    const preview = bookmarks.flatMap((item) => {
      if (!selectedSet.has(item.id)) return [];
      const changes: string[] = [];
      if (bulkTitle.trim() && bulkTitle.trim() !== item.title) {
        changes.push("标题");
      }
      if (bulkFolder.trim() && bulkFolder.trim() !== item.folderPath) {
        changes.push("目录");
      }
      if (nextTags.length > 0) {
        if (appendTagsOnly) {
          const current = new Set(item.tags ?? []);
          if (nextTags.some((tag) => !current.has(tag))) {
            changes.push("标签(追加)");
          }
        } else {
          const current = (item.tags ?? []).join("|");
          const next = nextTags.join("|");
          if (current !== next) {
            changes.push("标签(覆盖)");
          }
        }
      }
      if (changes.length === 0) return [];
      return [{ id: item.id, title: item.title, changes }];
    });
    setBulkPreviewItems(preview);
  };

  const handleUndoBulk = () => {
    if (history.length === 0) {
      setStatus("暂无可撤销的批量编辑");
      return;
    }
    const snapshot = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBookmarks(snapshot);
    setStatus("已撤销上一次操作");
  };

  const handleRemoveTagFromSelected = (tag: string) => {
    if (selectedIds.length === 0) {
      setStatus("请先选择书签");
      return;
    }
    setHistory((entries) =>
      [...entries, cloneBookmarks(bookmarks)].slice(-MAX_HISTORY),
    );
    setBookmarks((prev) =>
      prev.map((item) => {
        if (!selectedSet.has(item.id)) return item;
        return {
          ...item,
          tags: (item.tags ?? []).filter((t) => t !== tag),
        };
      }),
    );
    setStatus(`已从选中项移除标签：${tag}`);
  };

  const handleMergeSelectedTagsToTarget = () => {
    if (selectedIds.length === 0) {
      setStatus("请先选择书签");
      return;
    }
    const target = mergeSelectedTarget.trim();
    if (!target) {
      setStatus("请输入目标标签");
      return;
    }
    const sources = selectedTagStats
      .map((stat) => stat.tag)
      .filter((tag) => tag !== target);
    if (sources.length === 0) {
      setStatus("无可合并的来源标签");
      return;
    }
    setHistory((entries) =>
      [...entries, cloneBookmarks(bookmarks)].slice(-MAX_HISTORY),
    );
    setBookmarks((prev) =>
      prev.map((item) => {
        if (!selectedSet.has(item.id)) return item;
        const current = new Set(item.tags ?? []);
        let changed = false;
        for (const tag of sources) {
          if (current.delete(tag)) changed = true;
        }
        if (changed) current.add(target);
        return { ...item, tags: Array.from(current) };
      }),
    );
    setStatus("已合并选中项标签");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Chrome 书签整理工具</h1>
        <p className="text-sm text-muted-foreground">
          支持导入/导出、可达性检测、AI 整理、去重合并与报告导出。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => fileInputRef.current?.click()}
            >
              导入书签
            </Button>
            <ReadmeDialog readmeUrl="/api/bookmarks/readme" showRefresh />
            <Button
              type="button"
              variant="secondary"
              onClick={handleExportHtml}
            >
              导出 HTML
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExportJson}
            >
              导出 JSON
            </Button>
            <Button type="button" variant="secondary" onClick={handleRunCheck}>
              可达性检测
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleFetchMetadata}
            >
              抓取标题/图标
            </Button>
            <Button type="button" variant="secondary" onClick={handleRunAi}>
              AI 整理
            </Button>
            <Button type="button" variant="secondary" onClick={handleApplyAi}>
              应用 AI 建议
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleImport(file);
                event.target.value = "";
              }
            }}
          />
          {status ? (
            <div className="text-sm text-emerald-600">{status}</div>
          ) : null}
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettingsOpen(true)}
            >
              并发设置
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveInvalid}
            >
              清理失效链接 ({invalidBookmarks.length})
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportReportCsv}
            >
              导出 CSV 报告
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportReportJson}
            >
              导出 JSON 报告
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
            <div className="font-medium">统计</div>
            <div className="flex flex-wrap gap-3 text-muted-foreground">
              <span>书签数量：{bookmarks.length}</span>
              <span>筛选结果：{filteredBookmarks.length}</span>
              <span>失效链接：{invalidBookmarks.length}</span>
              <span>并发设置：{settings.concurrency}</span>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between text-sm font-medium">
              标签面板
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setActiveTag(null)}
              >
                清除筛选
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tagStats.length === 0 ? (
                <span className="text-xs text-muted-foreground">暂无标签</span>
              ) : (
                tagStats.map(({ tag, count }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs ${
                      activeTag === tag
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {tag} ({count})
                  </button>
                ))
              )}
            </div>
            {activeTag ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => handleApplyTagToSelected(activeTag)}
              >
                应用标签到选中项
              </Button>
            ) : null}
            <div className="space-y-2 border-t pt-3">
              <Label>选中项标签集合</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTagStats.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    请选择书签以查看标签
                  </span>
                ) : (
                  selectedTagStats.map(({ tag, count }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleRemoveTagFromSelected(tag)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600 hover:border-slate-300"
                    >
                      {tag} ({count})
                    </button>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                点击标签可从选中项移除
              </p>
              <div className="space-y-2">
                <Input
                  value={mergeSelectedTarget}
                  onChange={(event) =>
                    setMergeSelectedTarget(event.target.value)
                  }
                  placeholder="合并到目标标签"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMergeSelectedTagsToTarget}
                >
                  合并选中项标签到目标
                </Button>
              </div>
            </div>
            <div className="space-y-2 border-t pt-3">
              <Label htmlFor="tag-remove">批量移除标签（逗号分隔）</Label>
              <Input
                id="tag-remove"
                value={tagRemoveInput}
                onChange={(event) => setTagRemoveInput(event.target.value)}
                placeholder="例如：旧标签,待清理"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveTags}
              >
                移除标签（仅选中项）
              </Button>
            </div>
            <div className="space-y-2 border-t pt-3">
              <Label>合并标签</Label>
              <Input
                value={tagMergeSource}
                onChange={(event) => setTagMergeSource(event.target.value)}
                placeholder="来源标签（逗号分隔）"
              />
              <Input
                value={tagMergeTarget}
                onChange={(event) => setTagMergeTarget(event.target.value)}
                placeholder="目标标签"
              />
              <Button type="button" variant="outline" onClick={handleMergeTags}>
                合并到目标标签
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">书签列表</h2>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setBookmarks(mergeBookmarks(bookmarks))}
          >
            去重合并
          </Button>
        </div>
        <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <Label htmlFor="search">搜索</Label>
            <Input
              id="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、URL、标签、目录"
            />
          </div>
          <div className="space-y-2">
            <Label>批量编辑</Label>
            <Dialog>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    打开批量编辑
                  </Button>
                </DialogTrigger>
                <span className="text-xs text-muted-foreground">
                  已选 {selectedIds.length} 项
                </span>
                {bulkPreview ? (
                  <span className="text-xs text-emerald-700">
                    预览：{bulkPreview}
                  </span>
                ) : null}
              </div>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>批量编辑</DialogTitle>
                  <DialogDescription>
                    对选中书签批量更新标题、目录与标签。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Input
                    value={bulkTitle}
                    onChange={(event) => setBulkTitle(event.target.value)}
                    placeholder="批量标题（可选）"
                  />
                  <Input
                    value={bulkFolder}
                    onChange={(event) => setBulkFolder(event.target.value)}
                    placeholder="批量目录（可选）"
                  />
                  <Input
                    value={bulkTags}
                    onChange={(event) => setBulkTags(event.target.value)}
                    placeholder="批量标签（逗号分隔）"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={appendTagsOnly}
                      onChange={(event) =>
                        setAppendTagsOnly(event.target.checked)
                      }
                    />
                    仅追加标签（不覆盖已有标签）
                  </label>
                  {bulkPreview ? (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      预览：{bulkPreview}
                    </div>
                  ) : null}
                  {bulkPreviewItems.length > 0 ? (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <div className="font-semibold">
                        仅预览变化的列表（{bulkPreviewItems.length}）
                      </div>
                      <div className="mt-2 space-y-1">
                        {bulkPreviewItems.slice(0, 6).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2"
                          >
                            <span className="truncate">{item.title}</span>
                            <span className="text-[10px] uppercase text-slate-400">
                              {item.changes.join("/")}
                            </span>
                          </div>
                        ))}
                        {bulkPreviewItems.length > 6 ? (
                          <div className="text-slate-500">
                            还有 {bulkPreviewItems.length - 6} 条未显示
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="default"
                      onClick={handleBulkApply}
                    >
                      应用到选中项 ({selectedIds.length})
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedIds([])}
                    >
                      清空选择
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviewBulk}
                    >
                      预览批量编辑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUndoBulk}
                    >
                      撤销批量编辑
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="rounded-lg border">
          <Table className="table-fixed min-w-[900px]">
            <colgroup>
              <col className="w-10" />
              <col className="w-[320px]" />
              <col className="w-[200px]" />
              <col className="w-[140px]" />
              <col className="w-[200px]" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted text-xs font-semibold uppercase">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="select all"
                  />
                </TableHead>
                <TableHead>标题/URL</TableHead>
                <TableHead>目录/标签</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>AI 建议</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <div className="max-h-[60vh] overflow-auto">
            <Table className="table-fixed min-w-[900px]">
              <colgroup>
                <col className="w-10" />
                <col className="w-[320px]" />
                <col className="w-[200px]" />
                <col className="w-[140px]" />
                <col className="w-[200px]" />
              </colgroup>
              <TableBody>
                {filteredBookmarks.map((item) => (
                  <TableRow key={item.id} className="text-sm">
                    <TableCell className="align-top">
                      <input
                        type="checkbox"
                        checked={selectedSet.has(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        aria-label={`select ${item.title}`}
                      />
                    </TableCell>
                    <TableCell className="space-y-1 align-top whitespace-normal">
                      <div className="flex items-center gap-2">
                        {item.faviconUrl ? (
                          <Image
                            src={item.faviconUrl}
                            alt=""
                            width={16}
                            height={16}
                            className="h-4 w-4"
                            referrerPolicy="no-referrer"
                            unoptimized
                          />
                        ) : null}
                        <div className="font-medium">{item.title}</div>
                      </div>
                      <div className="text-xs text-muted-foreground break-all">
                        {item.url}
                      </div>
                    </TableCell>
                    <TableCell className="space-y-1 align-top text-xs whitespace-normal">
                      <div>{item.folderPath || "未分类"}</div>
                      <div className="text-muted-foreground">
                        {(item.tags ?? []).join(" / ") || "无标签"}
                      </div>
                    </TableCell>
                    <TableCell className="space-y-1 align-top text-xs whitespace-normal">
                      <div>
                        {item.status === null
                          ? "检测失败"
                          : item.status
                            ? `HTTP ${item.status}`
                            : "未检测"}
                      </div>
                      <div className="text-muted-foreground">
                        {item.responseTimeMs ? `${item.responseTimeMs} ms` : ""}
                      </div>
                    </TableCell>
                    <TableCell className="space-y-1 align-top text-xs whitespace-normal">
                      <div>{item.aiSuggestedFolder || ""}</div>
                      <div className="text-muted-foreground">
                        {item.aiSuggestedTitle || ""}
                      </div>
                      <div className="text-muted-foreground">
                        {(item.aiSuggestedTags ?? []).join(" / ")}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
            <div className="text-lg font-semibold">并发设置</div>
            <div className="space-y-2">
              <Label htmlFor="concurrency">HTTP 检测并发</Label>
              <Input
                id="concurrency"
                type="number"
                min={1}
                max={MAX_CONCURRENCY}
                value={settings.concurrency}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setSettings((prev) => ({
                    ...prev,
                    concurrency: Math.min(
                      MAX_CONCURRENCY,
                      Math.max(1, Number.isNaN(value) ? 1 : value),
                    ),
                  }));
                }}
              />
              <p className="text-xs text-muted-foreground">
                默认 8，最大 {MAX_CONCURRENCY}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSettingsOpen(false)}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
