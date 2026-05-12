"use client";

import { Check, CheckCircle2, Clock3, DollarSign, ExternalLink, MapPin, ShieldCheck, Stethoscope } from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCheapestHospital,
  getClosestHospital,
} from "@/lib/patient-assistant-data";
import { useAssistantChatStore } from "@/lib/stores/assistant-chat-store";
import type { HospitalOption } from "@/types/patient-assistant";
import { currencyFormatter } from "@/lib/utils";

export function HospitalComparisonDialog({
  open,
  onOpenChange,
  hospitals,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitals: HospitalOption[];
}) {
  const selectedHospitalId = useAssistantChatStore((s) => s.selectedHospitalId);
  const selectHospital = useAssistantChatStore((s) => s.selectHospital);
  const list = hospitals.length ? hospitals : [];
  const closest = list.length ? getClosestHospital(list) : null;
  const cheapest = list.length ? getCheapestHospital(list) : null;
  const comparison = uniqueHospitals([cheapest, closest, ...list]).slice(0, 3);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[min(88dvh,680px)] max-w-[min(94vw,760px)] gap-4 overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-lg">Comparar opciones</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Vista orientativa con distancia, copago y cobertura estimada. Confirma disponibilidad con el centro y tu aseguradora.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-3">
          {comparison.map((hospital) => (
            <CompareCard
              badges={[
                hospital.id === cheapest?.id ? "Más económica" : "",
                hospital.id === closest?.id ? "Más cercana" : "",
              ].filter(Boolean)}
              hospital={hospital}
              key={hospital.id}
              onSelect={() => {
                selectHospital(hospital.id);
                onOpenChange(false);
              }}
              selected={selectedHospitalId === hospital.id}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompareCard({
  hospital,
  badges,
  selected,
  onSelect,
}: {
  hospital: HospitalOption;
  badges: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  const osmUrl = hospital.lat && hospital.lon ? `https://www.openstreetmap.org/#map=16/${hospital.lat}/${hospital.lon}` : null;

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-3">
      <div className="flex flex-wrap gap-1">
        {badges.length ? (
          badges.map((badge) => (
            <Badge className="h-5 px-2 text-[10px]" key={badge} variant={badge.includes("econ") ? "emerald" : "default"}>
              {badge}
            </Badge>
          ))
        ) : (
          <Badge className="h-5 px-2 text-[10px]" variant="secondary">
            Alternativa
          </Badge>
        )}
      </div>

      <p className="mt-3 line-clamp-2 break-words text-sm font-semibold leading-tight">{hospital.name}</p>
      <p className="mt-1 line-clamp-2 break-words text-[11px] leading-snug text-muted-foreground">{hospital.address}</p>

      <div className="mt-3 space-y-2 text-[11px]">
        <Metric icon={MapPin} label="Distancia" value={`${hospital.distanceKm.toFixed(1)} km`} />
        <Metric icon={Clock3} label="Tiempo" value={hospital.estimatedTime} />
        <Metric icon={DollarSign} label="Copago" value={currencyFormatter.format(hospital.estimatedCost)} />
        <Metric icon={ShieldCheck} label="Cobertura" value={hospital.coverageEstimate ?? "Verificar póliza"} />
        <Metric icon={Stethoscope} label="Especialidad" value={hospital.specialty} />
      </div>

      <div className="mt-3 rounded-lg bg-muted/35 p-2 text-[11px] leading-snug text-muted-foreground">
        <div className="mb-1 flex items-center gap-1 font-semibold text-foreground">
          <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
          Ventaja
        </div>
        <p className="line-clamp-3 break-words">{hospital.aiRecommendation}</p>
      </div>

      <div className="mt-3 grid gap-2">
        <Button className="h-8 rounded-lg text-xs" onClick={onSelect} size="sm" type="button" variant={selected ? "default" : "outline"}>
          {selected ? <Check className="size-3.5" aria-hidden /> : null}
          {selected ? "Seleccionada" : "Seleccionar opción"}
        </Button>
        <Button asChild={Boolean(osmUrl)} className="h-8 rounded-lg text-xs" disabled={!osmUrl} size="sm" type="button" variant="ghost">
          {osmUrl ? (
            <a href={osmUrl} rel="noreferrer" target="_blank">
              <ExternalLink className="size-3.5" aria-hidden />
              Ver detalles
            </a>
          ) : (
            <span>Ver detalles</span>
          )}
        </Button>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <p className="font-medium text-foreground">{label}</p>
        <p className="line-clamp-2 break-words text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function uniqueHospitals(options: Array<HospitalOption | null>) {
  const seen = new Set<string>();
  return options.filter((option): option is HospitalOption => {
    if (!option || seen.has(option.id)) return false;
    seen.add(option.id);
    return true;
  });
}
