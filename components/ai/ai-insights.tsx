import { BrainCircuit, ClipboardCheck, HeartPulse } from "lucide-react";

import { conversations } from "@/lib/mock-data";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateFormatter, timeFormatter } from "@/lib/utils";

const insights = [
  {
    icon: HeartPulse,
    title: "Riesgo Alto",
    detail: "3 pacientes requieren revisión antes de 24 horas.",
    badge: "Prioridad",
  },
  {
    icon: ClipboardCheck,
    title: "Adherencia",
    detail: "Detectada baja adherencia en cohorte metabólica.",
    badge: "Seguimiento",
  },
  {
    icon: BrainCircuit,
    title: "Siguiente Mejor Acción",
    detail: "Automatizar resumen preconsulta para endocrinología.",
    badge: "IA",
  },
];

export function AiInsights() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight) => (
            <div className="rounded-xl border p-3" key={insight.title}>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <insight.icon aria-hidden="true" className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{insight.title}</p>
                    <Badge variant="secondary">{insight.badge}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Conversaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversations.map((conversation) => {
            const date = new Date(conversation.updatedAt);
            return (
              <button
                className="w-full rounded-xl border p-3 text-left outline-none transition-[background-color,box-shadow] hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                key={conversation.id}
                type="button"
              >
                <p className="font-medium">{conversation.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{conversation.summary}</p>
                <p className="tabular mt-2 text-xs text-muted-foreground">
                  {dateFormatter.format(date)} · {timeFormatter.format(date)}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
