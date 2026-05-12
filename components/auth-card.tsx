"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(8, "Usa al menos 8 caracteres."),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(3, "Ingresa tu nombre completo."),
  role: z.string().min(2, "Selecciona un rol clínico."),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm<LoginValues | RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "", role: "Médico general" },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    toast.success(mode === "login" ? "Sesión iniciada" : "Cuenta clínica creada");
  };

  const isLogin = mode === "login";

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[1fr_0.9fr]" id="main-content">
      <section className="hidden border-r bg-sidebar p-8 lg:flex lg:flex-col lg:justify-between">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck aria-hidden="true" className="size-4" />
          </span>
          <span translate="no">Medicare Assistant</span>
        </Link>
        <div className="max-w-xl">
          <p className="text-sm font-medium text-primary">Acceso seguro</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Operación clínica con una interfaz precisa y confiable.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Gestiona turnos, historiales y análisis IA desde un entorno diseñado para equipos médicos reales.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Cumplimiento, auditoría y roles listos para integrar.</p>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:justify-end">
            <Link className="flex items-center gap-2 font-semibold lg:hidden" href="/">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck aria-hidden="true" className="size-4" />
              </span>
              <span translate="no">Medicare</span>
            </Link>
            <ThemeToggle />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{isLogin ? "Ingresar" : "Crear Cuenta"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Accede al panel clínico." : "Registra tu espacio médico."}
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
                {!isLogin ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">Nombre completo</label>
                    <Input
                      autoComplete="name"
                      id="name"
                      placeholder="Dra. Ana Beltrán…"
                      {...form.register("name" as const)}
                    />
                    {"name" in form.formState.errors ? (
                      <p className="text-sm text-destructive">{form.formState.errors.name?.message}</p>
                    ) : null}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Correo institucional</label>
                  <Input
                    autoComplete="email"
                    id="email"
                    inputMode="email"
                    placeholder="clinica@example.com…"
                    spellCheck={false}
                    type="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>
                {!isLogin ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="role">Rol clínico</label>
                    <Input
                      autoComplete="organization-title"
                      id="role"
                      placeholder="Médico general…"
                      {...form.register("role" as const)}
                    />
                    {"role" in form.formState.errors ? (
                      <p className="text-sm text-destructive">{form.formState.errors.role?.message}</p>
                    ) : null}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
                  <Input
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    id="password"
                    placeholder="Mínimo 8 caracteres…"
                    type="password"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password ? (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  ) : null}
                </div>
                <Button className="w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                  {isLogin ? "Ingresar al Dashboard" : "Crear Cuenta Médica"}
                </Button>
              </form>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                o continuar con
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button className="w-full" type="button" variant="outline">
                <Globe aria-hidden="true" /> Google Workspace
              </Button>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                <Link className="font-medium text-primary hover:underline" href={isLogin ? "/register" : "/login"}>
                  {isLogin ? "Crear cuenta" : "Ingresar"}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
