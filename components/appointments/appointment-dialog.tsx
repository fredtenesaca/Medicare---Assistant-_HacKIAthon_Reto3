"use client";

import { CalendarPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 550));
    setSaving(false);
    setOpen(false);
    toast.success("Cita programada");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <CalendarPlus aria-hidden="true" /> Nueva Cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar Cita</DialogTitle>
          <DialogDescription>Coordina agenda médica, modalidad y especialidad.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="appointment-patient">Paciente</label>
            <Input autoComplete="off" id="appointment-patient" name="appointment-patient" placeholder="Camila Torres…" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="appointment-date">Fecha</label>
            <Input id="appointment-date" name="appointment-date" type="date" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="appointment-time">Hora</label>
            <Input id="appointment-time" name="appointment-time" type="time" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="appointment-specialty">Especialidad</label>
            <Input autoComplete="off" id="appointment-specialty" name="appointment-specialty" placeholder="Cardiología…" />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={saving} onClick={save} type="button">
            {saving ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
            Guardar Cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
