"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";

const GlobalFloatingChat = dynamic(
  () => import("@/components/chat/global-floating-chat").then((mod) => ({ default: mod.GlobalFloatingChat })),
  { loading: () => null, ssr: false },
);

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
        href="#main-content"
      >
        Saltar al contenido
      </a>
      {children}
      <GlobalFloatingChat />
      <div aria-live="polite" className="sr-only" id="toast-announcements" />
      <Toaster />
    </ThemeProvider>
  );
}
