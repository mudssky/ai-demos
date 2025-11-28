"use client";
import type { FC } from "react";
import { cn } from "@/lib/utils";

export interface HtmlPreviewProps {
  html: string;
  className?: string;
  height?: number | string;
  title?: string;
}

const HtmlPreview: FC<HtmlPreviewProps> = ({
  html,
  className,
  height,
  title,
}) => {
  const iframeHeight =
    typeof height === "number" ? `${height}px` : (height ?? "400px");
  return (
    <div className={cn("w-full border rounded-md overflow-hidden", className)}>
      <iframe
        title={title ?? "HTML Preview"}
        srcDoc={html}
        className="w-full"
        style={{ height: iframeHeight }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default HtmlPreview;
