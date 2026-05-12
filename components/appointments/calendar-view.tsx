import { appointments } from "@/lib/mock-data";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div className="min-h-36 rounded-xl border bg-muted/25 p-2" key={day}>
              <p className="text-xs font-medium text-muted-foreground">{day}</p>
              <p className="tabular mt-1 text-lg font-semibold">{10 + index}</p>
              {appointments[index % appointments.length] ? (
                <div className="mt-3 rounded-lg bg-card p-2 text-xs shadow-sm">
                  <p className="truncate font-medium">{appointments[index % appointments.length].patient}</p>
                  <p className="tabular text-muted-foreground">{appointments[index % appointments.length].time}</p>
                  <Badge className="mt-2" variant="secondary">{appointments[index % appointments.length].mode}</Badge>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
