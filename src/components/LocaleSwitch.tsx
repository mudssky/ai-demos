"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { FC } from "react";
import { Button } from "@/components/ui/button";

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
    <Button asChild variant="outline" size="sm">
      <Link href={href} aria-label={label} title={label}>
        {label}
      </Link>
    </Button>
  );
};

export default LocaleSwitch;
