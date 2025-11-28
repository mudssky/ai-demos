"use client";
import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  currentLocale: "en-US" | "zh-CN";
};

const LocaleSwitch: FC<Props> = ({ currentLocale }) => {
  const t = useTranslations("Common.locale");
  const pathname = usePathname();

  const buildHref = (target: "en-US" | "zh-CN") => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return `/${target}`;
    segments[0] = target;
    return `/${segments.join("/")}`;
  };

  const hrefEN = buildHref("en-US");
  const hrefZH = buildHref("zh-CN");

  const labelEN = t("switchToEN");
  const labelZH = t("switchToZH");

  const currentLabel = currentLocale === "en-US" ? "EN" : "中文";
  const currentTitle = currentLocale === "en-US" ? labelZH : labelEN;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Language"
          title={currentTitle}
        >
          <Languages className="mr-1" /> {currentLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={currentLocale === "en-US"} asChild>
          <Link href={hrefEN} aria-label={labelEN} title={labelEN}>
            EN
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={currentLocale === "zh-CN"} asChild>
          <Link href={hrefZH} aria-label={labelZH} title={labelZH}>
            中文
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleSwitch;
