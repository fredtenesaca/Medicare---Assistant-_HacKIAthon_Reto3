import { Bot, Hospital, MapPin, ReceiptText, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

export function AssistantPreview() {
  return (
    <div className="relative">
      <div className="absolute -right-4 top-6 hidden rounded-xl border bg-card p-3 shadow-xl lg:block">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin aria-hidden="true" className="size-4 text-primary" />
          3 hospitales cerca
        </div>
      </div>
      <div className="absolute -left-4 bottom-10 hidden rounded-xl border bg-card p-3 shadow-xl lg:block">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ReceiptText aria-hidden="true" className="size-4 text-primary" />
          Pago estimado $28
        </div>
      </div>
      <Card className="overflow-hidden p-4 shadow-2xl shadow-primary/10">
        <div className="rounded-xl border bg-background p-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="font-semibold">Asistente Médico IA</p>
                <p className="text-sm text-muted-foreground">Consulta guiada para pacientes</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Activo
            </span>
          </div>
          <div className="space-y-3 py-4">
            <div className="max-w-[88%] rounded-xl bg-muted p-3 text-sm leading-6">
              Hola, soy tu asistente médico inteligente. Estoy aquí para ayudarte a encontrar la mejor atención médica y estimar tu pago.
            </div>
            <div className="ml-auto max-w-[78%] rounded-xl bg-primary p-3 text-sm leading-6 text-primary-foreground">
              Tengo fiebre y dolor de cabeza desde ayer.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, label: "Validación segura" },
              { icon: Hospital, label: "Hospital recomendado" },
            ].map((item) => (
              <div className="rounded-lg border bg-card p-3" key={item.label}>
                <item.icon aria-hidden="true" className="mb-2 size-4 text-primary" />
                <p className="text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
