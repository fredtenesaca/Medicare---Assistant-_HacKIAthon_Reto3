import { medicalTimeline } from "@/lib/mock-data";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateFormatter } from "@/lib/utils";

export function MedicalTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Médica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {medicalTimeline.map((event) => (
          <article className="relative border-l-2 border-primary/20 pl-5" key={event.id}>
            <span className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-background bg-primary" />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{dateFormatter.format(new Date(event.date))} · {event.doctor}</p>
                <h3 className="mt-1 font-semibold">{event.title}</h3>
              </div>
              <Badge variant="default">{event.type}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
