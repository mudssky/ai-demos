import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function generateStaticParams(): Array<{ locale: "en" | "zh" }> {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground")}>
      \
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link href="/en" className="font-semibold">
            AI Demos
          </Link>
          <nav className="text-sm"></nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
