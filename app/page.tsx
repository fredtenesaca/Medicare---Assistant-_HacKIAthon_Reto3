import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  DollarSign,
  HeartPulse,
  Hospital,
  MapPin,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { AssistantPreview } from "@/components/marketing/assistant-preview";
import { OpenChatButton } from "@/components/chat/open-chat-button";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SiteHeader } from "@/components/marketing/site-header";
import { MotionReveal } from "@/components/motion-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { value: "128+", label: "hospitales conectados", icon: Hospital },
  { value: "24k", label: "pacientes atendidos", icon: UsersRound },
  { value: "91%", label: "precisión IA", icon: BrainCircuit },
];

const problemCards = [
  {
    icon: MapPin,
    title: "Decisión con poca información",
    detail: "Cuando aparecen síntomas, muchas personas no saben qué centro médico elegir ni qué tan lejos queda.",
  },
  {
    icon: DollarSign,
    title: "Costos difíciles de comparar",
    detail: "El sistema muestra pagos aproximados para que el paciente pueda evaluar opciones antes de movilizarse.",
  },
  {
    icon: Clock3,
    title: "Tiempo de respuesta",
    detail: "La consulta guiada reduce fricción y ayuda a encontrar atención cercana con recomendaciones rápidas.",
  },
];

const benefits = [
  "Encuentra hospitales cercanos rápidamente",
  "Compara costos aproximados",
  "Obtén recomendaciones inteligentes",
  "Ahorra tiempo",
  "Mejora tu toma de decisiones médicas",
];

export default function LandingPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="relative overflow-hidden border-b bg-background">
        <div className="absolute inset-0 medical-grid opacity-55" />
        <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/12 to-transparent" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:px-8 lg:py-24">
          <MotionReveal>
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
                <HeartPulse aria-hidden="true" className="size-4 text-primary" />
                Health-tech inteligente para pacientes
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Encuentra la mejor atención médica cerca de ti con ayuda de IA
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Describe tus síntomas y Medicare Assistant te ayudará a encontrar hospitales cercanos, comparar opciones y estimar tu pago.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <OpenChatButton size="lg">
                  Comenzar Consulta <ArrowRight aria-hidden="true" />
                </OpenChatButton>
                <Button asChild size="lg" variant="outline">
                  <a href="#como-funciona">Ver Cómo Funciona</a>
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div className="rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur" key={stat.label}>
                    <stat.icon aria-hidden="true" className="mb-3 size-5 text-primary" />
                    <p className="tabular text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <AssistantPreview />
          </MotionReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="problema">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-primary">¿A Qué Responde El Proyecto?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Orientación médica simple cuando más la necesitas
            </h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Muchas personas no saben a qué hospital acudir cuando presentan síntomas o molestias. Medicare Assistant ayuda a encontrar opciones médicas cercanas, comparar costos aproximados y recibir recomendaciones inteligentes de forma rápida y sencilla.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {problemCards.map((card) => (
              <Card className="h-full" key={card.title}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <card.icon aria-hidden="true" className="size-5" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{card.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="border-y bg-muted/25" id="beneficios">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-medium text-primary">Beneficios</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Una plataforma clara para decidir mejor</h2>
            <p className="mt-4 text-muted-foreground leading-7">
              El asistente combina validación, ubicación, comparación y ticket resumen en una experiencia premium que se siente útil sin parecer un chat genérico.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm" key={benefit}>
                <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-primary" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Comienza con una consulta guiada</h2>
            <p className="mt-3 text-muted-foreground">
              El chatbot vive dentro de la plataforma como herramienta principal para llegar a resultados, comparativas y ticket.
            </p>
          </div>
          <OpenChatButton className="mt-6 lg:mt-0" size="lg">
            Abrir Asistente <ArrowRight aria-hidden="true" />
          </OpenChatButton>
        </div>
      </section>

      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p translate="no">© 2026 Medicare Assistant</p>
          <div className="flex gap-4">
            <Link className="hover:text-foreground" href="/?openChat=1">Asistente</Link>
            <Link className="hover:text-foreground" href="/results">Resultados</Link>
            <Link className="hover:text-foreground" href="/ticket">Ticket</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
