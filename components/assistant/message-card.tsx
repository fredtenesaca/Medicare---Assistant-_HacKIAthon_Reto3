import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MessageCard({
  children,
  className,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  /** Padding reducido para burbujas del chat flotante. */
  compact?: boolean;
}) {
  return (
    <Card className={cn("border-primary/15 bg-background/90 shadow-none", className)}>
      <CardContent className={cn(compact ? "p-2.5 sm:p-3" : "p-4")}>{children}</CardContent>
    </Card>
  );
}
