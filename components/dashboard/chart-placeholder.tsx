import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Rendimiento Clínico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-72 items-end gap-3 rounded-xl border bg-muted/30 p-4">
          {[38, 56, 44, 72, 64, 88, 76].map((height, index) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={height + index}>
              <div
                className="w-full rounded-t-lg bg-primary/70"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-muted-foreground">{index + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 aria-hidden="true" className="size-4" />
          Consultas, alertas y recomendaciones IA por día.
        </div>
      </CardContent>
    </Card>
  );
}
