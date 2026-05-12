"use client";

import {
  Bot,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "Pacientes", icon: UsersRound },
  { href: "/dashboard/appointments", label: "Citas", icon: CalendarDays },
  { href: "/dashboard/medical-history", label: "Historial Clínico", icon: ClipboardList },
  { href: "/dashboard/ai", label: "IA Médica", icon: Bot },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Button
        aria-label="Abrir navegación"
        className="fixed left-4 top-4 z-40 lg:hidden"
        onClick={() => setMobileOpen(true)}
        size="icon-sm"
        type="button"
        variant="outline"
      >
        <Menu aria-hidden="true" />
      </Button>
      {mobileOpen ? (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex border-r bg-sidebar text-sidebar-foreground transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-dvh lg:translate-x-0",
          collapsed ? "w-[76px]" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col p-3">
          <div className="flex h-12 items-center justify-between gap-2">
            <Link className="flex min-w-0 items-center gap-2 font-semibold" href="/dashboard">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-sm font-bold">M</span>
              </span>
              <span className={cn("truncate", collapsed && "sr-only")} translate="no">
                Medicare Assistant
              </span>
            </Link>
            <Button
              aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              {collapsed ? <ChevronLeft aria-hidden="true" className="rotate-180" /> : <PanelLeftClose aria-hidden="true" />}
            </Button>
          </div>
          <nav aria-label="Navegación principal" className="mt-6 grid gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  className={cn(
                    "flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className={cn("mt-auto rounded-xl border bg-background/60 p-3", collapsed && "hidden")}>
            <p className="text-sm font-medium">IA clínica activa</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              14 alertas revisadas y 6 recomendaciones nuevas hoy.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
