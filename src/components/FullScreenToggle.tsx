"use client";
import { Maximize, Minimize } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FC, RefObject } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface FullScreenToggleProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  size?: number;
  active?: boolean;
  onToggle?: (to: boolean) => void;
}

const FullScreenToggle: FC<FullScreenToggleProps> = ({
  containerRef,
  className,
  size = 18,
  active: activeProp,
  onToggle,
}) => {
  const t = useTranslations("Demo");
  const [activeState, setActiveState] = useState<boolean>(false);
  const active = activeProp ?? activeState;

  useEffect(() => {
    if (onToggle) return;
    const handler = () => {
      setActiveState(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handler);
    handler();
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [onToggle]);

  const enter = async () => {
    if (onToggle) {
      onToggle(true);
      return;
    }
    const el = containerRef?.current ?? null;
    if (el?.requestFullscreen) await el.requestFullscreen();
  };

  const exit = async () => {
    if (onToggle) {
      onToggle(false);
      return;
    }
    if (document.exitFullscreen) await document.exitFullscreen();
  };

  const label = active ? t("fullscreen.exit") : t("fullscreen.enter");

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={active ? exit : enter}
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm bg-white/80 backdrop-blur hover:bg-white",
        className,
      )}
    >
      {active ? <Minimize size={size} /> : <Maximize size={size} />}
      <span className="ml-2 hidden sm:inline">{label}</span>
    </button>
  );
};

export default FullScreenToggle;
