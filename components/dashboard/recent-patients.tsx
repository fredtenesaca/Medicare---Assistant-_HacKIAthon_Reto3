import Link from "next/link";

import { patients } from "@/lib/mock-data";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentPatients() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes Recientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patients.slice(0, 4).map((patient) => (
          <Link
            className="flex items-center justify-between gap-3 rounded-lg border p-3 outline-none transition-[background-color,box-shadow] hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
            href={`/dashboard/patients/${patient.id}`}
            key={patient.id}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{patient.name}</p>
              <p className="truncate text-sm text-muted-foreground">{patient.condition}</p>
            </div>
            <Badge variant={patient.risk === "Alto" ? "rose" : patient.risk === "Medio" ? "amber" : "emerald"}>
              {patient.risk}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
