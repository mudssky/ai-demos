"use client";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import type { FC } from "react";
import { cn } from "@/lib/utils";

export interface ReactPreviewProps {
  code: string;
  className?: string;
  height?: number | string;
  title?: string;
}

const ReactPreview: FC<ReactPreviewProps> = ({
  code,
  className,
  height,
  title,
}) => {
  const previewHeight =
    typeof height === "number" ? `${height}px` : (height ?? "400px");
  return (
    <div
      className={cn("w-full border rounded-md overflow-hidden", className)}
      title={title ?? "React Preview"}
    >
      <SandpackProvider template="react-ts" files={{ "/App.tsx": code }}>
        <SandpackLayout>
          <SandpackPreview style={{ height: previewHeight }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default ReactPreview;
