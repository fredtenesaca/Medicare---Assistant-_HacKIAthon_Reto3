"use client";

import { Bot, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { ChatBubble } from "@/components/assistant/chat-bubble";
import { cn } from "@/lib/utils";

export function ChatbotMessage({
  role,
  children,
  wide = false,
}: {
  role: "bot" | "user";
  children: ReactNode;
  wide?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isUser = role === "user";

  return (
    <motion.div
      className={cn(
        "flex max-w-full min-w-0 gap-2 overflow-x-hidden",
        isUser ? "justify-end" : "justify-start",
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {!isUser ? (
        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/12">
          <Bot aria-hidden="true" className="size-3.5" />
        </div>
      ) : null}
      <div
        className={cn(
          "min-w-0 max-w-[calc(100%-2.25rem)] flex-1 overflow-hidden sm:max-w-[calc(100%-2.5rem)]",
          isUser && "flex justify-end",
        )}
      >
        <ChatBubble role={role} wide={wide}>
          {children}
        </ChatBubble>
      </div>
      {isUser ? (
        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border/50">
          <UserRound aria-hidden="true" className="size-3.5" />
        </div>
      ) : null}
    </motion.div>
  );
}
