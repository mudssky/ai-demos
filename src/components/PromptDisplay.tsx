"use client";
import { Check, Copy } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import type { AIData, PromptData } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface PromptDisplayProps {
  ai: AIData;
  prompt: PromptData;
  className?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      type="button"
      aria-label="copy"
      onClick={onCopy}
      className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      <span>{copied ? "已复制" : "复制"}</span>
    </button>
  );
}

const PromptDisplay: FC<PromptDisplayProps> = ({ ai, prompt, className }) => {
  return (
    <div className={cn("rounded-lg border p-4 space-y-4", className)}>
      <div>
        <h4 className="text-sm font-semibold">AI</h4>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border p-2">
            <div className="text-xs text-muted-foreground">Model</div>
            <div className="font-medium">{ai.model}</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-muted-foreground">Agent</div>
            <div className="font-medium">{ai.agent}</div>
          </div>
          {ai.provider ? (
            <div className="rounded border p-2">
              <div className="text-xs text-muted-foreground">Provider</div>
              <div className="font-medium">{ai.provider}</div>
            </div>
          ) : null}
          {typeof ai.temperature === "number" ? (
            <div className="rounded border p-2">
              <div className="text-xs text-muted-foreground">Temperature</div>
              <div className="font-medium">{ai.temperature}</div>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold">Prompt</h4>
        <div className="mt-2 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Main</span>
              <CopyButton text={prompt.main} />
            </div>
            <pre className="whitespace-pre-wrap rounded-md border bg-muted/50 p-2 text-sm">
              {prompt.main}
            </pre>
          </div>
          {prompt.system ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">System</span>
                <CopyButton text={prompt.system} />
              </div>
              <pre className="whitespace-pre-wrap rounded-md border bg-muted/50 p-2 text-sm">
                {prompt.system}
              </pre>
            </div>
          ) : null}
          {prompt.iteration ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Iteration</span>
                <CopyButton text={prompt.iteration} />
              </div>
              <pre className="whitespace-pre-wrap rounded-md border bg-muted/50 p-2 text-sm">
                {prompt.iteration}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PromptDisplay;
