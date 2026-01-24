"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

export type ReadmeDialogProps = {
  readmeUrl: string;
  markdown?: string;
  buttonLabel?: string;
  title?: string;
  maxWidthClassName?: string;
  className?: string;
  buttonVariant?: "default" | "secondary" | "outline" | "ghost";
  buttonClassName?: string;
  showRefresh?: boolean;
};

/**
 * 帮助文档弹窗组件
 * @param readmeUrl 帮助文档地址
 * @param markdown 直接传入的文档内容
 * @param buttonLabel 触发按钮文案
 * @param title 弹窗标题
 * @param maxWidthClassName 弹窗最大宽度样式
 * @param className 弹窗容器自定义样式
 * @param buttonVariant 按钮样式
 * @param buttonClassName 按钮自定义样式
 * @param showRefresh 是否显示刷新按钮
 * @returns 弹窗触发按钮与内容
 */
export default function ReadmeDialog({
  readmeUrl,
  markdown,
  buttonLabel = "查看帮助文档",
  title = "帮助文档",
  maxWidthClassName = "max-w-3xl",
  className,
  buttonVariant = "outline",
  buttonClassName,
  showRefresh = false,
}: ReadmeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载文档内容，支持强制刷新
   * @param force 是否强制重新请求
   * @returns 无
   */
  const loadContent = useCallback(
    (force = false) => {
      if (markdown) {
        setContent(markdown);
        return;
      }
      if (!readmeUrl) {
        setError("未配置 readmeUrl");
        return;
      }
      if (!force && (content || loading)) return;
      setLoading(true);
      fetch(readmeUrl)
        .then((res) => {
          if (!res.ok) throw new Error("读取帮助文档失败");
          return res.text();
        })
        .then((text) => setContent(text))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "读取帮助文档失败"),
        )
        .finally(() => setLoading(false));
    },
    [content, loading, markdown, readmeUrl],
  );

  useEffect(() => {
    if (!open) return;
    loadContent();
  }, [open, loadContent]);

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        className={buttonClassName}
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className={`flex max-h-[85vh] w-full flex-col gap-4 overflow-hidden rounded-lg bg-white p-6 shadow ${maxWidthClassName} ${className ?? ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{title}</div>
              <div className="flex items-center gap-2">
                {showRefresh && !markdown ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadContent(true)}
                  >
                    刷新
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  关闭
                </Button>
              </div>
            </div>
            {loading ? (
              <div className="text-sm text-muted-foreground">加载中...</div>
            ) : null}
            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : null}
            {content ? (
              <div className="min-h-0 flex-1 overflow-auto max-w-none text-sm [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800 [&_p]:mt-2 [&_p]:text-slate-700 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:text-slate-700 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:text-slate-800 [&_pre]:mt-3 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:text-slate-100">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
