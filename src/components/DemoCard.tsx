import Link from "next/link";
import type { FC } from "react";
import type { DemoSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DemoCardProps {
  demo: DemoSummary;
  href?: string;
  className?: string;
}

const DemoCard: FC<DemoCardProps> = ({ demo, href, className }) => {
  const card = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold leading-6 text-slate-900">
            {demo.title}
          </h3>
          {demo.description ? (
            <p className="mt-2 text-sm text-slate-600">{demo.description}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
            demo.type === "html"
              ? "bg-secondary/20 text-slate-700"
              : "bg-primary/15 text-slate-700",
          )}
        >
          {demo.type.toUpperCase()}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {demo.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Model: {demo.ai.model}</span>
        <span className="text-slate-300">•</span>
        <span>Agent: {demo.ai.agent}</span>
        <span className="text-slate-300">•</span>
        <span>{new Date(demo.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {card}
      </Link>
    );
  }
  return card;
};

export default DemoCard;
