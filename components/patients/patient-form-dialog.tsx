"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const patientSchema = z.object({
  name: z.string().min(3, "Ingresa el nombre completo."),
  email: z.string().email("Ingresa un correo válido."),
  phone: z.string().min(8, "Ingresa un teléfono válido."),
  condition: z.string().min(4, "Describe la condición clínica."),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export function PatientFormDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: "", email: "", phone: "", condition: "" },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setIsSubmitting(false);
    setOpen(false);
    form.reset();
    toast.success("Paciente guardado");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" /> Nuevo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Paciente</DialogTitle>
          <DialogDescription>Registra datos clínicos básicos para iniciar seguimiento.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="patient-name">Nombre</label>
            <Input autoComplete="name" id="patient-name" placeholder="Camila Torres…" {...form.register("name")} />
            {form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="patient-email">Correo</label>
            <Input
              autoComplete="email"
              id="patient-email"
              inputMode="email"
              placeholder="paciente@example.com…"
              spellCheck={false}
              type="email"
              {...form.register("email")}
            />
            {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="patient-phone">Teléfono</label>
            <Input autoComplete="tel" id="patient-phone" inputMode="tel" placeholder="+593 99 000 0000…" type="tel" {...form.register("phone")} />
            {form.formState.errors.phone ? <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="patient-condition">Condición</label>
            <Input autoComplete="off" id="patient-condition" placeholder="Hipertensión controlada…" {...form.register("condition")} />
            {form.formState.errors.condition ? <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p> : null}
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
              Guardar Paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
