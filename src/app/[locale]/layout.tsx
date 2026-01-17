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
        <header className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/en-US" className="font-semibold">
              AI Demos
            </Link>
            <nav className="text-sm">
              <LocaleSwitch currentLocale={locale} />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </NextIntlClientProvider>
    </div>
  );
}
