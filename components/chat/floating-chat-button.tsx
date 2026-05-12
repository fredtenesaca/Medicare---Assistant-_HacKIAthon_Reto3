"use client";

import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useAssistantChatStore } from "@/lib/stores/assistant-chat-store";
import { cn } from "@/lib/utils";

export function FloatingChatButton() {
  const reduceMotion = useReducedMotion();
  const isOpen = useAssistantChatStore((s) => s.isOpen);
  const isMinimized = useAssistantChatStore((s) => s.isMinimized);
  const open = useAssistantChatStore((s) => s.open);
  const toggleMinimized = useAssistantChatStore((s) => s.toggleMinimized);

  const panelVisible = isOpen && !isMinimized;

  const handleClick = () => {
    if (!isOpen) {
      open();
      return;
    }
    if (isMinimized) {
      toggleMinimized();
      return;
    }
    toggleMinimized();
  };

  return (
    <motion.button
      aria-expanded={panelVisible}
      aria-haspopup="dialog"
      aria-label={panelVisible ? "Minimizar asistente médico" : "Abrir asistente médico"}
      className={cn(
        "fixed bottom-5 right-4 z-[81] flex size-14 items-center justify-center rounded-full sm:bottom-6 sm:right-6",
        "border border-white/25 bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.12)_inset] dark:border-white/15 dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)]",
        "transition-transform hover:scale-[1.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      onClick={handleClick}
      type="button"
      whileHover={reduceMotion ? undefined : { scale: 1.05 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
    >
      <span className="absolute inset-0 rounded-full bg-primary/25 blur-xl dark:bg-primary/35" aria-hidden />
      <span
        className="absolute right-3 top-3 size-2.5 rounded-full border-2 border-primary-foreground/90 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
        title="En línea"
      />
      <MessageCircle aria-hidden className="relative size-7" strokeWidth={1.75} />
    </motion.button>
  );
}
