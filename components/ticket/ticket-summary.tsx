"use client";

import { CalendarDays, FileText, Hospital, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

import { TicketActions } from "@/components/ticket-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fallbackLocation } from "@/lib/assistant-chat-logic";
import { mockCitizen, nearbyHospitals as demoHospitals } from "@/lib/patient-assistant-data";
import { buildConsultPdfPayload } from "@/lib/pdf/consult-pdf";
import { getSelectedHospitalFromStore, useAssistantChatStore } from "@/lib/stores/assistant-chat-store";
import { currencyFormatter, dateFormatter } from "@/lib/utils";

export function TicketSummary() {
  useEffect(() => {
    void useAssistantChatStore.persist.rehydrate();
  }, []);

  const nearbyHospitalOptions = useAssistantChatStore((s) => s.nearbyHospitalOptions);
  const selectedHospitalId = useAssistantChatStore((s) => s.selectedHospitalId);
  const selectedSymptoms = useAssistantChatStore((s) => s.selectedSymptoms);
  const suggestedSpecialtyRaw = useAssistantChatStore((s) => s.suggestedSpecialty);
  const suggestedSpecialty = suggestedSpecialtyRaw?.trim() ? suggestedSpecialtyRaw : "Medicina general";
  const location = useAssistantChatStore((s) => s.location);

  const hospital =
    getSelectedHospitalFromStore(nearbyHospitalOptions, selectedHospitalId) ?? demoHospitals[0];
  const symptoms = selectedSymptoms.length ? selectedSymptoms : ["fiebre", "tos", "dolor de cabeza"];
  const createdAt = new Date();
  const hasLiveData = nearbyHospitalOptions.length > 0;

  const payloadPreview = buildConsultPdfPayload({
    patient: mockCitizen,
    symptoms,
    suggestedSpecialty,
    nearbyHospitalOptions: nearbyHospitalOptions.length ? nearbyHospitalOptions : demoHospitals,
    selectedHospitalId,
    locationLabel: location?.label ?? fallbackLocation.label,
  });

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <p className="text-sm font-medium text-primary">Ticket/PDF</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Resumen de consulta</h1>
          {!hasLiveData ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Mostrando datos demo hasta que completes el flujo en el chat y guardes una opción.
            </p>
          ) : null}
        </div>
        <TicketActions consultPayload={payloadPreview} />
      </div>

      <Card className="print:border-none print:shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText aria-hidden="true" className="size-6 text-primary" />
                Ticket Medicare Assistant
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Documento de orientación en beneficios (no diagnóstico clínico).
              </p>
            </div>
            <Badge variant={hasLiveData ? "emerald" : "secondary"}>{hasLiveData ? "Desde chat" : "Demo"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <InfoBlock icon={UserRound} label="Paciente" value={mockCitizen.name} />
            <InfoBlock icon={CalendarDays} label="Fecha" value={dateFormatter.format(createdAt)} />
            <InfoBlock icon={FileText} label="Cédula" value={mockCitizen.idNumber} />
            <InfoBlock icon={Hospital} label="Seguro médico" value={mockCitizen.insurance} />
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="font-semibold">Síntomas reportados</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary">
                  {symptom}
                </Badge>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-muted/20 p-4">
            <h2 className="font-semibold">Especialidad sugerida (orientación)</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{suggestedSpecialty}</p>
          </section>

          <section className="rounded-xl border bg-primary/5 p-4">
            <h2 className="font-semibold">Hospital seleccionado</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Nombre:</span> {hospital.name}
              </p>
              <p>
                <span className="text-muted-foreground">Especialidad:</span> {hospital.specialty}
              </p>
              <p>
                <span className="text-muted-foreground">Distancia:</span> {hospital.distanceKm.toFixed(1)} km
              </p>
              <p>
                <span className="text-muted-foreground">Pago estimado:</span>{" "}
                {currencyFormatter.format(hospital.estimatedCost)}
              </p>
              {hospital.coverageEstimate ? (
                <p className="sm:col-span-2">
                  <span className="text-muted-foreground">Cobertura estimada:</span> {hospital.coverageEstimate}
                </p>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{hospital.aiRecommendation}</p>
          </section>

          <p className="text-xs leading-5 text-muted-foreground">
            Este ticket es orientación informativa y no reemplaza una evaluación médica profesional. Si presentas
            síntomas graves, acude a emergencias.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <Icon aria-hidden="true" className="mb-3 size-5 text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
