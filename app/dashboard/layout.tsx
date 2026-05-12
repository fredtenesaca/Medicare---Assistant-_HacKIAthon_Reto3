import type { ReactNode } from "react";

import { DashboardNavbar } from "@/components/dashboard/navbar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <DashboardNavbar />
        <main className="p-4 sm:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
