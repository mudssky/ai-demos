"use client";
import type { FC, ForwardedRef } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface HtmlPreviewProps {
  html: string;
  className?: string;
  height?: number | string;
  title?: string;
}

const HtmlPreview = forwardRef(function HtmlPreview(
  { html, className, height, title }: HtmlPreviewProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const containerHeight =
    typeof height === "number" ? `${height}px` : (height ?? undefined);
  return (
    <div
      ref={ref}
      className={cn(
        "w-full border rounded-md overflow-hidden relative bg-white",
        className,
      )}
      style={{ height: containerHeight ?? "100%" }}
    >
      <iframe
        title={title ?? "HTML Preview"}
        srcDoc={html}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        referrerPolicy="no-referrer"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
});

export default HtmlPreview;
