import { appointments } from "@/lib/mock-data";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UpcomingAppointments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Citas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.slice(0, 3).map((appointment) => (
          <div className="rounded-lg border p-3" key={appointment.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">{appointment.patient}</p>
              <Badge variant={appointment.status === "Confirmada" ? "emerald" : "amber"}>{appointment.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {appointment.time} · {appointment.specialty}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
