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
        "group rounded-lg border p-4 hover:shadow-sm transition-shadow",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold leading-6">{demo.title}</h3>
          {demo.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {demo.description}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
            demo.type === "html"
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          {demo.type.toUpperCase()}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {demo.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        <span>Model: {demo.ai.model}</span>
        <span className="mx-2">•</span>
        <span>Agent: {demo.ai.agent}</span>
        <span className="mx-2">•</span>
        <span>{new Date(demo.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }
  return card;
};

export default DemoCard;
