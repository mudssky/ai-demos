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
    <Link href={href} className="text-sm rounded border px-2 py-1">
      {label}
    </Link>
  );
};

export default LocaleSwitch;
