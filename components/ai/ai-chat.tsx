"use client";

import { Bot, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "He revisado las alertas de hoy. El paciente Andrés Molina muestra mayor prioridad por tendencia glucémica y próxima cita pendiente.",
  },
  {
    role: "user",
    content: "Genera un resumen clínico breve para endocrinología.",
  },
  {
    role: "assistant",
    content:
      "Resumen: diabetes tipo 2 con glucosa en ayunas elevada, adherencia irregular y ajuste reciente de metformina. Recomiendo control en 72 horas y educación terapéutica.",
  },
];

export function AiChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    const value = prompt.trim();
    if (!value) return;
    setPrompt("");
    startTransition(() => {
      setMessages((current) => [
        ...current,
        { role: "user", content: value },
        {
          role: "assistant",
          content:
            "Análisis generado: prioriza revisión de signos de alarma, medicación activa y fecha de último control antes de tomar decisiones clínicas.",
        },
      ]);
    });
    toast.success("Respuesta IA generada");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-5 text-primary" />
          Chat Médico IA
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-[650px] flex-col gap-4">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div className="flex gap-3" key={`${message.role}-${index}`}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                {message.role === "assistant" ? <Bot aria-hidden="true" className="size-4" /> : <UserRound aria-hidden="true" className="size-4" />}
              </div>
              <div className="rounded-xl border bg-background p-3 text-sm leading-6 shadow-xs">
                {message.content}
              </div>
            </div>
          ))}
          {isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Analizando…
            </div>
          ) : null}
        </div>
        <div className="rounded-xl border bg-background p-2">
          <label className="sr-only" htmlFor="ai-prompt">Mensaje para IA médica</label>
          <Textarea
            id="ai-prompt"
            name="ai-prompt"
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit();
            }}
            placeholder="Pregunta por riesgo, resumen clínico o recomendaciones…"
            value={prompt}
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={submit} type="button">
              <Send aria-hidden="true" /> Enviar Consulta
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
