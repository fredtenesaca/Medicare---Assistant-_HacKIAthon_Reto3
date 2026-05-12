import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "Medicare Assistant",
  description: "SaaS médico inteligente para gestión clínica asistida por IA.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
