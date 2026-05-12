import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold">Vista no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa el identificador del recurso o vuelve al panel principal.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
