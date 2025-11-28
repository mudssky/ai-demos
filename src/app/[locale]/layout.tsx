import Link from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function generateStaticParams(): Array<{ locale: "en" | "zh" }> {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: unknown;
}) {
  let resolvedParams: { locale: string };
  if (params && typeof (params as Promise<unknown>).then === "function") {
    resolvedParams = await (params as Promise<{ locale: string }>);
  } else {
    resolvedParams = params as { locale: string };
  }
  const locale = resolvedParams?.locale === "zh" ? "zh" : "en";
  let messages: Record<string, unknown>;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <div className={cn("min-h-screen bg-background text-foreground")}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <header className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/en" className="font-semibold">
              AI Demos
            </Link>
            <nav className="text-sm"></nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </NextIntlClientProvider>
    </div>
  );
}
