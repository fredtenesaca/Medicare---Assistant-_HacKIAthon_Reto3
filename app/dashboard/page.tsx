import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RecentPatients } from "@/components/dashboard/recent-patients";
import { StatCard } from "@/components/dashboard/stat-card";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { stats } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Domingo, 10 de mayo de 2026</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Centro de Comando Clínico</h2>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <ChartPlaceholder />
        <RecentActivity />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <UpcomingAppointments />
        <RecentPatients />
      </section>
    </div>
  );
}
