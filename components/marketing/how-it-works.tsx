import { Bot, Download, Hospital, IdCard, MapPinned, MessageSquareText } from "lucide-react";

import { MotionReveal } from "@/components/motion-reveal";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: IdCard, title: "Ingresa tu número de cédula", detail: "Validamos datos mock para personalizar la consulta." },
  { icon: MessageSquareText, title: "Describe tus síntomas", detail: "Puedes escribir libremente o usar sugerencias rápidas." },
  { icon: MapPinned, title: "Permitimos acceso a tu ubicación", detail: "Usamos geolocalización del navegador con tu permiso." },
  { icon: Bot, title: "La IA analiza hospitales cercanos", detail: "Compara cercanía, costos y especialidad disponible." },
  { icon: Hospital, title: "Recibe recomendaciones y costos estimados", detail: "Visualiza opciones en cards claras y accionables." },
  { icon: Download, title: "Descarga tu ticket/PDF", detail: "Genera un resumen para llevar o compartir." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="como-funciona">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Cómo Funciona</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Un flujo guiado, claro y rápido</h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => (
          <MotionReveal delay={index * 0.04} key={step.title}>
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon aria-hidden="true" className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-muted-foreground">Paso {index + 1}</span>
                    <h3 className="mt-1 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
