"use client";

import { Bot } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function ChatTypingIndicator() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex items-center gap-2.5"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
        <Bot aria-hidden="true" className="size-3.5" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-background/55 px-3.5 py-2.5 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-background/40">
        {[0, 1, 2].map((item) => (
          <span
            className="size-1.5 animate-pulse rounded-full bg-primary/80"
            key={item}
            style={{ animationDelay: `${item * 160}ms` }}
          />
        ))}
        <span className="sr-only">El asistente está escribiendo…</span>
      </div>
    </motion.div>
  );
}
