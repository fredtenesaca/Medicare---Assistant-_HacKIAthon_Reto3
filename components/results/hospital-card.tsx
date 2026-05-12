import { Clock3, DollarSign, MapPin, Star } from "lucide-react";

import type { HospitalOption } from "@/types/patient-assistant";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter } from "@/lib/utils";

export function HospitalCard({ hospital, featured = false }: { hospital: HospitalOption; featured?: boolean }) {
  return (
    <Card className={featured ? "border-primary/40 shadow-lg shadow-primary/10" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{hospital.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{hospital.specialty}</p>
          </div>
          {featured ? <Badge>Recomendado</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border bg-muted/25 p-3">
            <MapPin aria-hidden="true" className="mb-2 size-4 text-primary" />
            <p className="tabular font-semibold">{hospital.distanceKm.toFixed(1)} km</p>
            <p className="text-muted-foreground">Distancia</p>
          </div>
          <div className="rounded-lg border bg-muted/25 p-3">
            <DollarSign aria-hidden="true" className="mb-2 size-4 text-primary" />
            <p className="tabular font-semibold">{currencyFormatter.format(hospital.estimatedCost)}</p>
            <p className="text-muted-foreground">Costo aprox.</p>
          </div>
          <div className="rounded-lg border bg-muted/25 p-3">
            <Clock3 aria-hidden="true" className="mb-2 size-4 text-primary" />
            <p className="tabular font-semibold">{hospital.estimatedTime}</p>
            <p className="text-muted-foreground">Tiempo</p>
          </div>
          <div className="rounded-lg border bg-muted/25 p-3">
            <Star aria-hidden="true" className="mb-2 size-4 text-primary" />
            <p className="tabular font-semibold">{hospital.rating.toFixed(1)}</p>
            <p className="text-muted-foreground">Rating</p>
          </div>
        </div>
        <div className="rounded-lg border bg-primary/5 p-3">
          <p className="text-sm font-medium">Recomendación IA</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{hospital.aiRecommendation}</p>
        </div>
        <Button className="w-full" type="button" variant={featured ? "default" : "outline"}>
          Seleccionar Opción
        </Button>
      </CardContent>
    </Card>
  );
}
