"use client";

import type React from "react";
import { CommandInput } from "@/components/ui/command";

/**
 * @param placeholder 搜索输入框占位文案
 * @returns 搜索输入框组件
 */
export default function BulkSearchInput({
  placeholder,
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  return <CommandInput placeholder={placeholder} {...props} />;
}
