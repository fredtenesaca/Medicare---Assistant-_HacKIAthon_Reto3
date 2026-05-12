"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Pacientes",
  appointments: "Citas",
  "medical-history": "Historial Clínico",
  ai: "IA Médica",
};

export function DashboardNavbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const current = segments.at(-1) ?? "dashboard";

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-16 items-center gap-3 px-4 pl-16 sm:px-6 lg:pl-6">
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="hidden text-xs text-muted-foreground sm:block">
            {segments.map((segment, index) => (
              <span key={`${segment}-${index}`}>
                {index > 0 ? <span className="mx-1">/</span> : null}
                <span>{labels[segment] ?? segment}</span>
              </span>
            ))}
          </nav>
          <h1 className="truncate text-lg font-semibold">{labels[current] ?? "Detalle"}</h1>
        </div>
        <div className="relative hidden w-full max-w-xs md:block">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <label className="sr-only" htmlFor="global-search">Buscar</label>
          <Input
            autoComplete="off"
            className="pl-9"
            id="global-search"
            name="global-search"
            placeholder="Buscar pacientes, citas…"
          />
        </div>
        <Button aria-label="Ver notificaciones" size="icon-sm" type="button" variant="outline">
          <Bell aria-hidden="true" />
        </Button>
        <ThemeToggle />
        <div className="hidden items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 sm:flex">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            VR
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Dra. Valeria Ríos</p>
          </div>
        </div>
      </div>
    </header>
  );
}
