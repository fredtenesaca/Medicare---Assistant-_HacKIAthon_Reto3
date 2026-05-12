import { AiChat } from "@/components/ai/ai-chat";
import { AiInsights } from "@/components/ai/ai-insights";

export default function AiPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Análisis asistido</p>
        <h2 className="text-2xl font-semibold tracking-tight">IA Médica</h2>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <AiChat />
        <AiInsights />
      </section>
    </div>
  );
}
