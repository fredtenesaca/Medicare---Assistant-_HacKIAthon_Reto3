import { ArrowRight, Hospital } from "lucide-react";
import Link from "next/link";

import { HospitalCard } from "@/components/results/hospital-card";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCitizen, nearbyHospitals } from "@/lib/patient-assistant-data";

export default function ResultsPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Resultados</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Hospitales y clínicas cercanas
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Opciones estimadas para {mockCitizen.name}, considerando síntomas, ubicación demo y costos aproximados.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/comparison">
              Ver Comparativa <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hospital aria-hidden="true" className="size-5 text-primary" />
              Opciones Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-3">
              {nearbyHospitals.map((hospital, index) => (
                <HospitalCard featured={index === 0} hospital={hospital} key={hospital.id} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/ticket">Generar Ticket/PDF</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/?openChat=1">Volver Al Asistente</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
