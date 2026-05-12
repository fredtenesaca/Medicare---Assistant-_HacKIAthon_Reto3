import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { medicalTimeline, patients } from "@/lib/mock-data";
import { dateFormatter } from "@/lib/utils";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patients.find((item) => item.id === id);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{patient.id}</p>
            <h2 className="text-3xl font-semibold tracking-tight">{patient.name}</h2>
            <p className="mt-2 text-muted-foreground">{patient.condition}</p>
          </div>
          <Badge variant={patient.risk === "Alto" ? "rose" : patient.risk === "Medio" ? "amber" : "emerald"}>
            Riesgo {patient.risk}
          </Badge>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Edad", `${patient.age} años`],
          ["Sangre", patient.bloodType],
          ["Estado", patient.status],
          ["Próxima cita", dateFormatter.format(new Date(patient.nextVisit))],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Correo:</span> {patient.email}</p>
            <p><span className="text-muted-foreground">Teléfono:</span> {patient.phone}</p>
            <p><span className="text-muted-foreground">Médico:</span> {patient.doctor}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timeline Clínico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalTimeline.slice(0, 3).map((event) => (
              <div className="border-l-2 border-primary/25 pl-4" key={event.id}>
                <p className="text-sm text-muted-foreground">{dateFormatter.format(new Date(event.date))} · {event.type}</p>
                <p className="font-medium">{event.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
