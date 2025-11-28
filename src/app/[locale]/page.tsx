import Link from "next/link";
import DemoCard from "@/components/DemoCard";
import SearchBar from "@/components/SearchBar";
import { getAllDemos } from "@/lib/demos";
import type { Locale } from "@/lib/types";

function ensureLocale(input: string): Locale {
  return input === "zh" ? "zh" : "en";
}

export default async function LocaleHome({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = ensureLocale(params.locale);
  const demos = await getAllDemos({ withContent: false, locale });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {locale === "zh" ? "示例列表" : "Demo List"}
        </h1>
        <Link
          href={locale === "zh" ? "/en" : "/zh"}
          className="text-sm rounded border px-2 py-1"
        >
          {locale === "zh" ? "Switch to EN" : "切换到中文"}
        </Link>
      </div>

      <SearchBar items={demos} locale={locale} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {demos.map((d) => (
          <DemoCard key={d.slug} demo={d} href={`/${locale}/demo/${d.slug}`} />
        ))}
      </div>
    </div>
  );
}
