"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ChatBubble({
  role,
  children,
  wide = false,
}: {
  role: "bot" | "user";
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border px-3.5 py-3 text-[13px] leading-relaxed shadow-xs sm:px-4 sm:py-3.5",
        role === "bot"
          ? "border-border/60 bg-card/95 text-card-foreground"
          : "border-primary/25 bg-primary text-primary-foreground",
        wide ? "w-full max-w-[24rem]" : "max-w-[min(92%,24rem)]",
      )}
    >
      <div className="max-w-full overflow-x-hidden">{children}</div>
    </div>
  );
}
