import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

import { OpenChatButton } from "@/components/chat/open-chat-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity aria-hidden="true" className="size-4" />
          </span>
          <span translate="no">Medicare Assistant</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link className="hover:text-foreground" href="/#problema">Proyecto</Link>
          <Link className="hover:text-foreground" href="/#como-funciona">Cómo Funciona</Link>
          <Link className="hover:text-foreground" href="/#beneficios">Beneficios</Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <OpenChatButton className="hidden sm:inline-flex" variant="outline">
            Consulta IA <ArrowRight aria-hidden="true" />
          </OpenChatButton>
        </div>
      </nav>
    </header>
  );
}
