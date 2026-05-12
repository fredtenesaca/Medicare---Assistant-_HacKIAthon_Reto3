"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ChatbotWindow } from "@/components/chat/chatbot-window";
import { FloatingChatButton } from "@/components/chat/floating-chat-button";
import { useAssistantChatStore } from "@/lib/stores/assistant-chat-store";

export function GlobalFloatingChat() {
  const reduceMotion = useReducedMotion();
  const isOpen = useAssistantChatStore((s) => s.isOpen);
  const isMinimized = useAssistantChatStore((s) => s.isMinimized);
  const openChatAndFocusInput = useAssistantChatStore((s) => s.openChatAndFocusInput);

  useEffect(() => {
    void useAssistantChatStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openChat") === "1") {
      openChatAndFocusInput();
      params.delete("openChat");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }
  }, [openChatAndFocusInput]);

  return (
    <>
      <FloatingChatButton />
      <AnimatePresence>
        {isOpen && !isMinimized ? (
          <motion.div
            className="fixed z-[80] flex h-[min(82dvh,720px)] max-h-[720px] w-[min(calc(100vw-1.5rem),420px)] flex-col overflow-hidden rounded-2xl border border-white/25 bg-background/72 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl dark:border-white/12 dark:bg-background/55 dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)_inset] max-sm:inset-x-3 max-sm:bottom-24 max-sm:h-[min(78dvh,640px)] max-sm:max-h-[640px] max-sm:w-auto sm:bottom-24 sm:right-6"
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            key="floating-chat-panel"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <ChatbotWindow />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
