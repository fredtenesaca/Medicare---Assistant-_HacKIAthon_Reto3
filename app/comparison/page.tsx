import { ArrowRight, BadgeDollarSign, MapPin } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCheapestHospital,
  getClosestHospital,
  nearbyHospitals,
} from "@/lib/patient-assistant-data";
import { currencyFormatter } from "@/lib/utils";

export default function ComparisonPage() {
  const closest = getClosestHospital(nearbyHospitals);
  const cheapest = getCheapestHospital(nearbyHospitals);

  return (
    <main id="main-content">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-medium text-primary">Comparativa</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Cercanía vs. costo aproximado
          </h1>
          <p className="mt-4 text-muted-foreground leading-7">
            Medicare Assistant compara opciones para que puedas decidir según urgencia, distancia y presupuesto.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="size-5 text-primary" />
                  Hospital Más Cercano
                </CardTitle>
                <Badge>Rapidez</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{closest.name}</h2>
                <p className="mt-1 text-muted-foreground">{closest.address}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Distancia" value={`${closest.distanceKm.toFixed(1)} km`} />
                <Metric label="Tiempo" value={closest.estimatedTime} />
                <Metric label="Costo" value={currencyFormatter.format(closest.estimatedCost)} />
              </div>
              <p className="rounded-xl border bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                {closest.aiRecommendation}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <BadgeDollarSign aria-hidden="true" className="size-5 text-primary" />
                  Hospital Más Económico
                </CardTitle>
                <Badge variant="emerald">Ahorro</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{cheapest.name}</h2>
                <p className="mt-1 text-muted-foreground">{cheapest.address}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Distancia" value={`${cheapest.distanceKm.toFixed(1)} km`} />
                <Metric label="Tiempo" value={cheapest.estimatedTime} />
                <Metric label="Costo" value={currencyFormatter.format(cheapest.estimatedCost)} />
              </div>
              <p className="rounded-xl border bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                {cheapest.aiRecommendation}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/ticket">
              Generar Ticket/PDF <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/results">Ver Resultados</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/25 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="tabular mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
