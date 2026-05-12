"use client";

import { Bot, Minus, Sparkles, X } from "lucide-react";

import { AssistantProgressSummary } from "@/components/chat/assistant-message-body";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AssistantPhase } from "@/lib/assistant-chat-types";
import { cn } from "@/lib/utils";

export function ChatbotHeader({
  phase,
  onMinimize,
  onClose,
}: {
  phase: AssistantPhase;
  onMinimize: () => void;
  onClose: () => void;
}) {
  const isComplete = phase === "results";

  return (
    <header className="shrink-0 border-b border-white/10 bg-background/85 backdrop-blur-md dark:border-white/10">
      <div className="flex items-center gap-2 px-2 py-1.5 sm:gap-2.5 sm:px-2.5 sm:py-2">
        <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:size-9">
          <Bot aria-hidden="true" className="size-4 sm:size-[18px]" />
          <span
            className="absolute -bottom-px -right-px size-2.5 rounded-full border-2 border-background bg-emerald-500"
            title="En línea"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-xs font-semibold tracking-tight sm:text-sm">Medicare Assistant</h2>
            <Badge
              className={cn(
                "h-5 shrink-0 gap-0.5 border-0 px-1.5 py-0 text-[9px] font-medium uppercase leading-none tracking-wide sm:h-5 sm:px-2 sm:text-[10px]",
                isComplete
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-muted/80 text-muted-foreground",
              )}
              variant="secondary"
            >
              <Sparkles aria-hidden="true" className="size-2.5 sm:size-3" />
              <span className="hidden sm:inline">{isComplete ? "Listo" : "IA activa"}</span>
              <span className="sm:hidden">{isComplete ? "OK" : "IA"}</span>
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            aria-label="Minimizar chat"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground sm:size-9 sm:rounded-xl"
            onClick={onMinimize}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Minus aria-hidden="true" className="size-4" />
          </Button>
          <Button
            aria-label="Cerrar chat"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground sm:size-9 sm:rounded-xl"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
      <AssistantProgressSummary phase={phase} />
    </header>
  );
}
