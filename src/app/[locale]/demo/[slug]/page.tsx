import Link from "next/link";
import HtmlPreview from "@/components/HtmlPreview";
import PromptDisplay from "@/components/PromptDisplay";
import ReactPreview from "@/components/ReactPreview";
import { getAllDemos, getDemoBySlug } from "@/lib/demos";
import type { Locale } from "@/lib/types";

function ensureLocale(input: string): Locale {
  return input === "zh" ? "zh" : "en";
}

export async function generateStaticParams(): Promise<
  Array<{ locale: Locale; slug: string }>
> {
  const locales: Locale[] = ["en", "zh"];
  const demos = await getAllDemos({ withContent: false, locale: "en" });
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
  params: { locale: string; slug: string };
}) {
  const locale: Locale = ensureLocale(params.locale);
  const demo = await getDemoBySlug(params.slug, locale);
  const isHtml = demo.entry === "/index.html";
  const titleText =
    typeof demo.title === "string"
      ? demo.title
      : locale === "zh" && (demo.title as { zh?: string; en: string }).zh
        ? ((demo.title as { zh?: string; en: string }).zh as string)
        : ((demo.title as { en: string }).en as string);
  const descText =
    typeof demo.description === "string"
      ? demo.description
      : locale === "zh" && (demo.description as { zh?: string; en: string }).zh
        ? ((demo.description as { zh?: string; en: string }).zh as string)
        : ((demo.description as { en: string }).en as string);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{titleText}</h1>
          {descText ? (
            <p className="text-sm text-muted-foreground">{descText}</p>
          ) : null}
        </div>
        <Link href={`/${locale}`} className="text-sm rounded border px-2 py-1">
          {locale === "zh" ? "返回列表" : "Back to List"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isHtml ? (
            <HtmlPreview html={demo.code} title={titleText} height={480} />
          ) : (
            <ReactPreview code={demo.code} title={titleText} height={480} />
          )}
        </div>
        <div>
          <PromptDisplay ai={demo.ai} prompt={demo.prompt} />
        </div>
      </div>
    </div>
  );
}
