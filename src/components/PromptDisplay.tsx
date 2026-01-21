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
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      <span>{copied ? "已复制" : "复制"}</span>
    </button>
  );
}

const PromptDisplay: FC<PromptDisplayProps> = ({ ai, prompt, className }) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur space-y-5",
        className,
      )}
    >
      <div>
        <h4 className="text-sm font-semibold text-slate-900">AI</h4>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="text-xs text-slate-500">Model</div>
            <div className="font-semibold text-slate-800">{ai.model}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="text-xs text-slate-500">Agent</div>
            <div className="font-semibold text-slate-800">{ai.agent}</div>
          </div>
          {ai.provider ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="text-xs text-slate-500">Provider</div>
              <div className="font-semibold text-slate-800">{ai.provider}</div>
            </div>
          ) : null}
          {typeof ai.temperature === "number" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="text-xs text-slate-500">Temperature</div>
              <div className="font-semibold text-slate-800">
                {ai.temperature}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-900">Prompt</h4>
        <div className="mt-2 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">Main</span>
              <CopyButton text={prompt.main} />
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {prompt.main}
            </pre>
          </div>
          {prompt.system ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">System</span>
                <CopyButton text={prompt.system} />
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {prompt.system}
              </pre>
            </div>
          ) : null}
          {prompt.iteration ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">Iteration</span>
                <CopyButton text={prompt.iteration} />
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
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
