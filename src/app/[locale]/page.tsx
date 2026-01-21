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
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeStr } = await params;
  const locale: Locale = ensureLocale(localeStr);
  const demos = await getAllDemos({ withContent: false, locale });
  const tHome = await getTranslations({ locale, namespace: "Home" });
  const isZh = locale === "zh-CN";
  const subtitle = isZh
    ? "精选 AI Demo 集合，覆盖交互、视觉、数据与体验实验。"
    : "A curated collection of AI demos spanning interaction, visuals, data, and experience experiments.";
  const total = demos.length;
  const htmlCount = demos.filter((d) => d.type === "html").length;
  const reactCount = demos.filter((d) => d.type === "react").length;
  const tagCount = new Set(demos.flatMap((d) => d.tags)).size;
  return (
    <div className="space-y-10">
      <section className="relative z-20 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {isZh ? "AI Demos" : "AI Demos"}
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {tHome("title")}
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">
              {subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: isZh ? "总示例" : "Total",
                value: total,
              },
              {
                label: "HTML",
                value: htmlCount,
              },
              {
                label: "React",
                value: reactCount,
              },
              {
                label: isZh ? "标签" : "Tags",
                value: tagCount,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
              >
                <div className="text-xs font-semibold uppercase text-slate-500">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <SearchBar items={demos} locale={locale} className="max-w-2xl" />
        </div>
      </section>

      <section className="relative z-0 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {isZh ? "全部示例" : "All demos"}
            </h2>
            <p className="text-sm text-slate-600">
              {isZh
                ? "按类别快速浏览并选择你感兴趣的实验。"
                : "Browse by category and pick the experiments you want to explore."}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
            {total} {isZh ? "条" : "items"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((d) => (
            <DemoCard
              key={d.slug}
              demo={d}
              href={`/${locale}/demo/${d.slug}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
