"use client";

import { Check, Info, MapPin, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HospitalOption } from "@/types/patient-assistant";
import { currencyFormatter } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ChatHospitalOption({
  hospital,
  selected,
  onSelect,
  onViewDetails,
  badge,
  optionLabel,
}: {
  hospital: HospitalOption;
  selected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  badge?: string;
  optionLabel: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden rounded-xl border bg-background/70 p-3 ring-offset-background transition-[box-shadow,border-color]",
        selected && "border-primary/50 ring-1 ring-primary/25",
        !selected && "border-border/70",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{optionLabel}</p>
          <p className="mt-1 truncate text-sm font-semibold leading-tight">{hospital.name}</p>
        </div>
        {badge ? (
          <Badge className="h-5 shrink-0 px-2 text-[10px]" variant={badge.includes("econ") ? "emerald" : "default"}>
            {badge}
          </Badge>
        ) : null}
      </div>

      <p className="mt-1.5 line-clamp-2 break-words text-[11px] leading-snug text-muted-foreground">
        {hospital.specialty}
      </p>
      <p className="mt-1 line-clamp-2 break-words text-[10px] leading-snug text-muted-foreground">
        {hospital.address}
      </p>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] text-muted-foreground tabular-nums">
        <span className="inline-flex min-w-0 items-center gap-1 overflow-hidden rounded-lg bg-muted/45 px-2 py-1">
          <MapPin className="size-3 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{hospital.distanceKm.toFixed(1)} km</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1 overflow-hidden rounded-lg bg-muted/45 px-2 py-1">
          <Timer className="size-3 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{hospital.estimatedTime}</span>
        </span>
        <span className="truncate rounded-lg bg-muted/45 px-2 py-1 font-semibold text-foreground">
          {currencyFormatter.format(hospital.estimatedCost)}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button
          aria-pressed={selected}
          className="h-8 rounded-lg text-xs"
          onClick={onSelect}
          size="sm"
          type="button"
          variant={selected ? "default" : "outline"}
        >
          {selected ? <Check className="size-3.5" aria-hidden /> : null}
          {selected ? "Seleccionada" : "Seleccionar opción"}
        </Button>
        <Button className="h-8 rounded-lg text-xs" onClick={onViewDetails} size="sm" type="button" variant="ghost">
          <Info className="size-3.5" aria-hidden />
          Ver detalles
        </Button>
      </div>
    </div>
  );
}
