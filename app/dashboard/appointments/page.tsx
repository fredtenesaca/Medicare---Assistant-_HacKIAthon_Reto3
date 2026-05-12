import { AppointmentDialog } from "@/components/appointments/appointment-dialog";
import { AppointmentsTable } from "@/components/appointments/appointments-table";
import { CalendarView } from "@/components/appointments/calendar-view";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Agenda operacional</p>
          <h2 className="text-2xl font-semibold tracking-tight">Citas</h2>
        </div>
        <AppointmentDialog />
      </section>
      <CalendarView />
      <AppointmentsTable />
    </div>
  );
}
