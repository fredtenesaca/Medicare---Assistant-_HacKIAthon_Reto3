"use client";

import {
  CheckCircle2,
  ClipboardList,
  Compass,
  ExternalLink,
  FileDown,
  Hospital,
  LocateFixed,
  MapPin,
  MessageCircle,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

import { ChatHospitalOption } from "@/components/chat/chat-hospital-option";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildConsultShareText, downloadConsultOrientationPdf, shareConsultOrientationPdf } from "@/lib/pdf/consult-pdf";
import { fallbackLocation } from "@/lib/assistant-chat-logic";
import type { AssistantChatMessageItem, AssistantLocationState, AssistantPhase } from "@/lib/assistant-chat-types";
import type { MedicalAgentResponse } from "@/types/medical-agent";
import { getHospitalRecomendado } from "@/lib/medical-orientation";
import { mockCitizen } from "@/lib/patient-assistant-data";
import { getSelectedHospitalFromStore, useAssistantChatStore } from "@/lib/stores/assistant-chat-store";
import { cn, currencyFormatter } from "@/lib/utils";
import type { HospitalOption } from "@/types/patient-assistant";

export function AssistantMessageBody({
  message,
  location,
  selectedSymptoms,
  phase,
  onRequestLocation,
}: {
  message: AssistantChatMessageItem;
  location: AssistantLocationState | null;
  selectedSymptoms: string[];
  phase: AssistantPhase;
  onRequestLocation: () => void;
}) {
  const nearbyHospitalOptions = useAssistantChatStore((s) => s.nearbyHospitalOptions);
  const selectedHospitalId = useAssistantChatStore((s) => s.selectedHospitalId);
  const selectHospital = useAssistantChatStore((s) => s.selectHospital);
  const suggestedSpecialty = useAssistantChatStore((s) => s.suggestedSpecialty);
  const openComparison = useAssistantChatStore((s) => s.openComparison);
  const resetConversation = useAssistantChatStore((s) => s.resetConversation);

  const currentLocation = location ?? fallbackLocation;
  const lat = currentLocation.lat;
  const lon = currentLocation.lon;

  const buildPayload = () => {
    const { masCercano, masEconomico } = getHospitalRecomendado(nearbyHospitalOptions);
    return {
      patient: mockCitizen,
      symptoms: selectedSymptoms,
      suggestedSpecialty,
      selectedHospital: getSelectedHospitalFromStore(nearbyHospitalOptions, selectedHospitalId),
      closestHospital: masCercano,
      cheapestHospital: masEconomico,
      locationLabel: currentLocation.label,
    };
  };

  if (message.kind === "patient") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
          Usuario validado
        </div>
        <InfoGrid
          items={[
            ["Nombre completo", mockCitizen.name],
            ["Edad", `${mockCitizen.age} años`],
            ["Tipo de seguro", mockCitizen.insurance],
            ["Plan", "PlusCare Premium"],
            ["Estado", "Activo"],
          ]}
        />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Cuéntame qué síntomas o molestias tienes para sugerirte una especialidad y buscar opciones cercanas.
        </p>
      </div>
    );
  }

  if (message.kind === "location-action") {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Ubicación aproximada</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Usamos tu posición solo para ordenar centros cercanos con OpenStreetMap, Overpass y Nominatim. Si no deseas compartir ubicación, podrás escribir tu ciudad manualmente.
          </p>
        </div>
        <Button
          className="h-9 w-full rounded-lg text-xs sm:w-auto"
          disabled={phase !== "location"}
          onClick={onRequestLocation}
          size="sm"
          type="button"
        >
          <LocateFixed aria-hidden="true" className="size-3.5" />
          Permitir ubicación
        </Button>
      </div>
    );
  }

  if (message.kind === "location") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Compass aria-hidden="true" className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Ubicación detectada</p>
            <p className="truncate text-[11px] text-muted-foreground">{currentLocation.label}</p>
          </div>
        </div>
        <InfoGrid
          items={[
            ["Ciudad", currentLocation.city ?? "Aproximada"],
            ["Provincia", currentLocation.province ?? "Aproximada"],
            ["Radio de búsqueda", "100 km"],
            ["Fuente", "OpenStreetMap"],
          ]}
        />
        <Button asChild className="h-8 rounded-lg text-xs" size="sm" variant="outline">
          <a href={`https://www.openstreetmap.org/#map=13/${lat}/${lon}`} rel="noreferrer" target="_blank">
            Ver mapa <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </Button>
      </div>
    );
  }

  if (message.kind === "agent-results") {
    const agentResponse = message.content as MedicalAgentResponse | undefined;
    if (!agentResponse) {
      return <p className="text-sm text-muted-foreground">No se pudo procesar la respuesta del agente médico.</p>;
    }

    const urgencyStyles = agentResponse.urgency === "ALTA"
      ? "bg-destructive/10 text-destructive"
      : agentResponse.urgency === "MEDIA"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

    const onPdf = async () => {
      try {
        await downloadConsultOrientationPdf(buildPayload());
        toast.success("PDF generado");
      } catch {
        toast.error("No se pudo generar el PDF");
      }
    };

    const onSharePdf = async () => {
      const payload = buildPayload();
      try {
        const shared = await shareConsultOrientationPdf(payload);
        if (shared) {
          toast.success("PDF listo para compartir");
          return;
        }
        toast("PDF descargado. Adjunta el archivo en la app que se abrirá.");
      } catch {
        toast.error("No se pudo preparar el PDF para compartir");
        return;
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(buildConsultShareText(payload))}`, "_blank", "noopener,noreferrer");
    };

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm text-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Análisis médico</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{agentResponse.analysis}</p>
            </div>
            <Badge className={`h-6 rounded-full px-2 text-[10px] font-semibold uppercase ${urgencyStyles}`}>
              {agentResponse.urgency}
            </Badge>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoGrid
              items={[
                ["Especialidad", agentResponse.specialty || "Medicina general"],
                ["Cobertura", agentResponse.coverage || "No disponible"],
                ["Copago estimado", agentResponse.copago || "No disponible"],
                ["Costo base", agentResponse.costBase || "No disponible"],
              ]}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Hospitales sugeridos</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Revisamos la opción con especialidad y cobertura más cercana a tu ubicación.
              </p>
            </div>
            <Button className="h-8 rounded-lg text-xs" onClick={openComparison} size="sm" type="button" variant="outline">
              Comparar
            </Button>
          </div>

          <div className="grid gap-3">
            {agentResponse.hospitals.map((hospital, index) => (
              <div key={`${hospital.id}-${index}`} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{hospital.name}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{hospital.address}</p>
                  </div>
                  <span className="rounded-full bg-muted/80 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                    {hospital.specialty || agentResponse.specialty}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 text-[11px] text-muted-foreground">
                  <div className="rounded-lg bg-muted/50 px-2 py-1">Distancia: {hospital.distanceKm?.toFixed(1) ?? "N/A"} km</div>
                  <div className="rounded-lg bg-muted/50 px-2 py-1">Copago: {hospital.copago ?? "No disponible"}</div>
                  <div className="rounded-lg bg-muted/50 px-2 py-1">Cobertura: {hospital.coverage ?? "No disponible"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button className="h-9 rounded-lg text-xs" onClick={openComparison} size="sm" type="button" variant="outline">
            Ver comparación
          </Button>
          <Button className="h-9 rounded-lg text-xs" onClick={onPdf} size="sm" type="button">
            Descargar PDF
          </Button>
          <Button className="h-9 rounded-lg text-xs" onClick={onSharePdf} size="sm" type="button" variant="secondary">
            Compartir
          </Button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-[12px] leading-relaxed text-muted-foreground">
          {agentResponse.recommendation || "Recomendación: verifica la cobertura y copago de tu plan antes de asistir al centro."}
        </div>
      </div>
    );
  }

  if (message.kind === "hospitals") {
    const { masCercano, masEconomico } = getHospitalRecomendado(nearbyHospitalOptions);
    const options = uniqueHospitals([masEconomico, masCercano, ...nearbyHospitalOptions]).slice(0, 4);

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Encontramos estas opciones para ti</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Ordenamos centros reales y opciones de respaldo por cercanía, copago estimado y compatibilidad con{" "}
            {suggestedSpecialty}.
          </p>
        </div>

        <div className="space-y-2">
          {options.map((hospital, index) => (
            <ChatHospitalOption
              badge={hospital.id === masEconomico.id ? "Más económica" : hospital.id === masCercano.id ? "Más cercana" : undefined}
              hospital={hospital}
              key={hospital.id}
              onSelect={() => selectHospital(hospital.id)}
              onViewDetails={openComparison}
              optionLabel={`Opción ${index + 1}`}
              selected={selectedHospitalId === hospital.id}
            />
          ))}
        </div>

        <Button className="h-9 w-full rounded-lg text-xs" onClick={openComparison} size="sm" type="button" variant="outline">
          Comparar opciones
        </Button>
      </div>
    );
  }

  if (message.kind === "final-actions") {
    const selected = getSelectedHospitalFromStore(nearbyHospitalOptions, selectedHospitalId);

    const onPdf = async () => {
      try {
        await downloadConsultOrientationPdf(buildPayload());
        toast.success("PDF generado");
      } catch {
        toast.error("No se pudo generar el PDF");
      }
    };

    const onSharePdf = async () => {
      const payload = buildPayload();
      try {
        const shared = await shareConsultOrientationPdf(payload);
        if (shared) {
          toast.success("PDF listo para compartir");
          return;
        }
        toast("PDF descargado. Adjunta el archivo en la app que se abrirá.");
      } catch {
        toast.error("No se pudo preparar el PDF para compartir");
        return;
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(buildConsultShareText(payload))}`, "_blank", "noopener,noreferrer");
    };

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Perfecto. Encontramos una opción adecuada para ti.</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Hemos preparado tu resumen médico preliminar.
          </p>
        </div>

        {selected ? (
          <div className="space-y-2 rounded-xl border border-border/70 bg-background/70 p-3">
            <SummaryRow label="Hospital seleccionado" value={selected.name} />
            <SummaryRow label="Especialidad" value={suggestedSpecialty || selected.specialty} />
            <SummaryRow label="Distancia" value={`${selected.distanceKm.toFixed(1)} km`} />
            <SummaryRow label="Costo estimado" value={currencyFormatter.format(selected.estimatedCost)} />
            <p className="pt-1 text-[12px] font-medium">¿Qué deseas hacer ahora?</p>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-3">
          <Button className="h-9 rounded-lg text-xs" onClick={openComparison} size="sm" type="button" variant="outline">
            Ver comparación
          </Button>
          <Button className="h-9 rounded-lg text-xs" onClick={() => void onPdf()} size="sm" type="button">
            <FileDown className="size-3.5" aria-hidden />
            Descargar PDF
          </Button>
          <Button className="h-9 rounded-lg text-xs" onClick={() => void onSharePdf()} size="sm" type="button" variant="secondary">
            <MessageCircle className="size-3.5" aria-hidden />
            Compartir
          </Button>
        </div>
        <Button className="h-9 w-full rounded-lg text-xs" onClick={resetConversation} size="sm" type="button" variant="outline">
          <RotateCcw className="size-3.5" aria-hidden />
          Nueva consulta
        </Button>
      </div>
    );
  }

  if (message.kind === "new-consultation-prompt") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold">¿Deseas iniciar una nueva consulta?</p>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Puedes comenzar otro flujo sin recargar la página.
        </p>
        <Button className="h-9 w-full rounded-lg text-xs sm:w-auto" onClick={resetConversation} size="sm" type="button" variant="outline">
          <RotateCcw className="size-3.5" aria-hidden />
          Nueva consulta
        </Button>
      </div>
    );
  }

  if (typeof message.content === "string" || typeof message.content === "number") {
    return <p className="max-w-full whitespace-pre-line hyphens-auto wrap-break-word text-[13px] leading-relaxed text-inherit">{message.content}</p>;
  }

  return <p className="max-w-full whitespace-pre-line hyphens-auto wrap-break-word text-[13px] leading-relaxed text-inherit">Respuesta del agente no disponible.</p>;
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div className="min-w-0 overflow-hidden rounded-lg bg-muted/35 px-2.5 py-2" key={label}>
          <p className="text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">{label}</p>
          <p className="mt-0.5 line-clamp-2 wrap-break-word text-[12px] font-medium text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="line-clamp-2 wrap-break-word text-[12px] font-medium text-foreground">{value}</p>
    </div>
  );
}

function uniqueHospitals(options: HospitalOption[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (!option || seen.has(option.id)) return false;
    seen.add(option.id);
    return true;
  });
}

function phaseStepIndex(phase: AssistantPhase): number {
  if (phase === "id" || phase === "validating") return 0;
  if (phase === "symptoms") return 1;
  if (phase === "location" || phase === "locating") return 2;
  return 3;
}

const STEP_DEFS = [
  { icon: ClipboardList, label: "Cédula" },
  { icon: Hospital, label: "Síntomas" },
  { icon: MapPin, label: "Ubicación" },
  { icon: ReceiptText, label: "Resultado" },
] as const;

export function AssistantProgressSummary({ phase }: { phase: AssistantPhase }) {
  const current = phaseStepIndex(phase);

  return (
    <div
      aria-label="Progreso de la consulta"
      className="flex max-h-7 items-center gap-0.5 border-t border-white/5 px-1.5 pb-1 pt-0.5 dark:border-white/5 sm:gap-1 sm:px-2"
      role="list"
    >
      {STEP_DEFS.map((step, index) => {
        const Icon = step.icon;
        const done = index < current;
        const active = index === current;

        return (
          <div
            aria-current={active ? "step" : undefined}
            className={cn(
              "inline-flex h-6 max-h-7 min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full border px-1 text-[9px] font-medium leading-none transition-colors sm:h-6 sm:flex-initial sm:gap-1 sm:px-2 sm:text-[10px]",
              done && "border-primary/20 bg-primary/10 text-primary dark:border-primary/25 dark:bg-primary/15",
              active &&
                "border-primary/45 bg-primary/14 text-foreground shadow-sm ring-1 ring-primary/20 dark:bg-primary/20",
              !done &&
                !active &&
                "border-border/50 bg-muted/25 text-muted-foreground dark:border-white/10 dark:bg-muted/20",
            )}
            key={step.label}
            role="listitem"
            title={step.label}
          >
            <Icon aria-hidden="true" className="size-2.5 shrink-0 opacity-90 sm:size-3" />
            <span className="max-w-13 truncate max-sm:sr-only sm:inline sm:max-w-20">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
