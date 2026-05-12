import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-muted">
        <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? (
        <Button className="mt-5" type="button">
          {action}
        </Button>
      ) : null}
    </div>
  );
}
