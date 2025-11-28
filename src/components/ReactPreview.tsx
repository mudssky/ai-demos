"use client";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import type { FC, ForwardedRef } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ReactPreviewProps {
  code: string;
  className?: string;
  height?: number | string;
  title?: string;
}

const ReactPreview = forwardRef(function ReactPreview(
  { code, className, height, title }: ReactPreviewProps,
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
      title={title ?? "React Preview"}
      style={{ height: containerHeight ?? "100%" }}
    >
      <SandpackProvider template="react-ts" files={{ "/App.tsx": code }}>
        <SandpackLayout>
          <SandpackPreview style={{ height: "100%" }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
});

export default ReactPreview;
