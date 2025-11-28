"use client";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import FullScreenToggle from "@/components/FullScreenToggle";
import HtmlPreview from "@/components/HtmlPreview";
import ReactPreview from "@/components/ReactPreview";
import { cn } from "@/lib/utils";

export interface PreviewSectionProps {
  kind: "html" | "react";
  code: string;
  title?: string;
  height?: number;
  className?: string;
}

const PreviewSection: FC<PreviewSectionProps> = ({
  kind,
  code,
  title,
  height = 720,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState<boolean>(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlay(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const containerClass = cn("relative", className);
  const containerStyle = { height: `${height}px` } as const;

  return (
    <div className={containerClass} style={containerStyle}>
      <div className="absolute right-2 top-2 z-10">
        <FullScreenToggle active={overlay} onToggle={setOverlay} />
      </div>
      {kind === "html" ? (
        <HtmlPreview ref={containerRef} html={code} title={title} />
      ) : (
        <ReactPreview ref={containerRef} code={code} title={title} />
      )}
      {overlay ? (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute right-3 top-3">
            <FullScreenToggle active={true} onToggle={setOverlay} />
          </div>
          <div style={{ height: "100vh", width: "100vw" }}>
            {kind === "html" ? (
              <HtmlPreview
                className="h-full"
                html={code}
                title={title}
                height={"100vh"}
              />
            ) : (
              <ReactPreview
                className="h-full"
                code={code}
                title={title}
                height={"100vh"}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PreviewSection;
