import { getTranslations } from "next-intl/server";
import DemoCard from "@/components/DemoCard";
import SearchBar from "@/components/SearchBar";
import { getAllDemos } from "@/lib/demos";
import type { Locale } from "@/lib/types";

function ensureLocale(input: string): Locale {
  return input === "zh-CN" ? "zh-CN" : "en-US";
}

export default async function LocaleHome({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = ensureLocale(params.locale);
  const demos = await getAllDemos({ withContent: false, locale });
  const tHome = await getTranslations({ locale, namespace: "Home" });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{tHome("title")}</h1>
        {/* Locale switch moved to header via LocaleSwitch component */}
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
