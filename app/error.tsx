"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
        <AlertTriangle aria-hidden="true" className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-xl font-semibold">No se pudo cargar la vista</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Intenta recargar. Si el problema continúa, revisa la conexión del servicio.
        </p>
        <Button className="mt-5" onClick={reset} type="button">
          Reintentar
        </Button>
      </div>
    </main>
  );
}
