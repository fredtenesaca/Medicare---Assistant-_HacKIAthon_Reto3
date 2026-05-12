import type { Stat } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneMap = {
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function StatCard({ stat }: { stat: Stat }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className={cn("flex size-10 items-center justify-center rounded-lg", toneMap[stat.tone])}>
            <stat.icon aria-hidden="true" className="size-5" />
          </div>
          <span className="tabular rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {stat.change}
          </span>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">{stat.label}</p>
        <p className="tabular mt-1 text-3xl font-semibold tracking-tight">{stat.value}</p>
      </CardContent>
    </Card>
  );
}
