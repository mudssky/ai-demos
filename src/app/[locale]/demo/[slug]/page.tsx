import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HtmlPreview from "@/components/HtmlPreview";
import PromptDisplay from "@/components/PromptDisplay";
import ReactPreview from "@/components/ReactPreview";
import { getAllDemos, getDemoBySlug } from "@/lib/demos";
import type { Locale } from "@/lib/types";

function ensureLocale(input: string): Locale {
  return input === "zh-CN" ? "zh-CN" : "en-US";
}

export async function generateStaticParams(): Promise<
  Array<{ locale: Locale; slug: string }>
> {
  const locales: Locale[] = ["en-US", "zh-CN"];
  const demos = await getAllDemos({
    withContent: false,
    locale: "en-US",
    includeAppDemos: false,
  });
  const pairs: Array<{ locale: Locale; slug: string }> = [];
  for (const d of demos) {
    for (const l of locales) {
      pairs.push({ locale: l, slug: d.slug });
    }
  }
  return pairs;
}

export default async function DemoDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeStr, slug } = await params;
  const locale: Locale = ensureLocale(localeStr);
  const demo = await getDemoBySlug(slug, locale);
  const tDemo = await getTranslations({ locale, namespace: "Demo" });
  const isHtml = demo.entry === "/index.html";
  const titleText = demo.title as string;
  const descText = typeof demo.description === "string" ? demo.description : "";
  const isZh = locale === "zh-CN";
  const previewLabel = isHtml
    ? isZh
      ? "HTML 预览"
      : "HTML Preview"
    : isZh
      ? "React 预览"
      : "React Preview";
  const promptLabel = isZh ? "提示词" : "Prompt";
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {demo.type.toUpperCase()}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              {titleText}
            </h1>
            {descText ? (
              <p className="text-sm text-slate-600 sm:text-base">{descText}</p>
            ) : null}
          </div>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {tDemo("backToList")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {previewLabel}
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {titleText}
            </span>
          </div>
          {isHtml ? (
            <HtmlPreview html={demo.code} title={titleText} height={480} />
          ) : (
            <ReactPreview code={demo.code} title={titleText} height={480} />
          )}
        </div>
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            {promptLabel}
          </h2>
          <PromptDisplay ai={demo.ai} prompt={demo.prompt} />
        </div>
      </section>
    </div>
  );
}
