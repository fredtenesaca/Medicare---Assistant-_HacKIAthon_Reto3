import { Pill, Stethoscope, Syringe } from "lucide-react";

import { MedicalTimeline } from "@/components/medical/medical-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const panels = [
  { icon: Stethoscope, title: "Diagnósticos", value: "18 activos", detail: "4 requieren seguimiento este mes" },
  { icon: Pill, title: "Medicamentos", value: "42 registros", detail: "8 ajustes recientes" },
  { icon: Syringe, title: "Tratamientos", value: "11 planes", detail: "3 en fase intensiva" },
];

export default function MedicalHistoryPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Información longitudinal</p>
        <h2 className="text-2xl font-semibold tracking-tight">Historial Clínico</h2>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {panels.map((panel) => (
          <Card key={panel.title}>
            <CardContent className="p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <panel.icon aria-hidden="true" className="size-5" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{panel.title}</p>
              <p className="mt-1 text-2xl font-semibold">{panel.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{panel.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <MedicalTimeline />
        <Card>
          <CardHeader>
            <CardTitle>Notas Médicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Priorizar pacientes con comorbilidades y seguimiento remoto incompleto.</p>
            <p>Revisar adherencia terapéutica en diabetes tipo 2 antes de nueva prescripción.</p>
            <p>Actualizar consentimiento informado en telemedicina para controles de junio.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
