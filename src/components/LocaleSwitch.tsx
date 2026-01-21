"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { FC } from "react";

type Props = {
  currentLocale: "en-US" | "zh-CN";
};

const LocaleSwitch: FC<Props> = ({ currentLocale }) => {
  const t = useTranslations("Common.locale");
  const pathname = usePathname();
  const target = currentLocale === "zh-CN" ? "en-US" : "zh-CN";
  const label = currentLocale === "zh-CN" ? t("switchToEN") : t("switchToZH");

  // Replace the first segment (locale) while preserving the rest of the path
  const href = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return `/${target}`;
    segments[0] = target;
    return `/${segments.join("/")}`;
  })();

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {label}
    </Link>
  );
};

export default LocaleSwitch;
