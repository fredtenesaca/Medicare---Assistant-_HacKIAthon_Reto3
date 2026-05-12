import type { LucideIcon } from "lucide-react";

export type PatientStatus = "Activo" | "Seguimiento" | "Crítico" | "Alta";
export type AppointmentStatus = "Confirmada" | "Pendiente" | "Cancelada" | "Completada";
export type AppointmentMode = "Presencial" | "Telemedicina";

export type Stat = {
  label: string;
  value: string;
  change: string;
  tone: "blue" | "emerald" | "amber" | "rose";
  icon: LucideIcon;
};

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodType: string;
  condition: string;
  risk: "Bajo" | "Medio" | "Alto";
  status: PatientStatus;
  lastVisit: string;
  nextVisit: string;
  doctor: string;
};

export type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
};

export type MedicalEvent = {
  id: string;
  date: string;
  title: string;
  doctor: string;
  type: "Diagnóstico" | "Medicación" | "Tratamiento" | "Nota";
  description: string;
  tags: string[];
};

export type Conversation = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
};
