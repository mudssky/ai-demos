import Link from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import LocaleSwitch from "@/components/LocaleSwitch";
import { cn } from "@/lib/utils";

export function generateStaticParams(): Array<{ locale: "en-US" | "zh-CN" }> {
  return [{ locale: "en-US" }, { locale: "zh-CN" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeStr } = await params;
  const locale = localeStr === "zh-CN" ? "zh-CN" : "en-US";
  let messages: Record<string, unknown>;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <div className={cn("min-h-screen bg-background text-foreground")}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl float-slow" />
          <div className="pointer-events-none absolute top-40 -left-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl float-slow" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-secondary/20 blur-3xl" />

          <header className="relative z-10">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
              <Link
                href={`/${locale}`}
                className="group inline-flex items-center gap-3"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
                  AI
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  AI Demos
                </span>
              </Link>
              <nav className="text-sm">
                <LocaleSwitch currentLocale={locale} />
              </nav>
            </div>
          </header>

          <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-4">
            {children}
          </main>
        </div>
      </NextIntlClientProvider>
    </div>
  );
}
