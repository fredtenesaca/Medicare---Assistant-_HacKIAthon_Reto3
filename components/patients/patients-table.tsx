"use client";

import { Edit, FileText, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useTransition } from "react";
import toast from "react-hot-toast";

import type { Patient } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateFormatter } from "@/lib/utils";

function riskVariant(risk: Patient["risk"]) {
  if (risk === "Alto") return "rose";
  if (risk === "Medio") return "amber";
  return "emerald";
}

export function PatientsTable({ patients }: { patients: Patient[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const query = searchParams.get("q") ?? "";
  const risk = searchParams.get("risk") ?? "Todos";
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesQuery =
        patient.name.toLowerCase().includes(normalized) ||
        patient.condition.toLowerCase().includes(normalized) ||
        patient.doctor.toLowerCase().includes(normalized);
      const matchesRisk = risk === "Todos" || patient.risk === risk;
      return matchesQuery && matchesRisk;
    });
  }, [deferredQuery, patients, risk]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "Todos") params.delete(key);
    else params.set(key, value);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <label className="sr-only" htmlFor="patient-search">Buscar pacientes</label>
          <Input
            autoComplete="off"
            className="pl-9"
            id="patient-search"
            name="patient-search"
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder="Buscar por nombre, condición…"
            value={query}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="size-4 text-muted-foreground" />
          <label className="sr-only" htmlFor="risk-filter">Filtrar riesgo</label>
          <select
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="risk-filter"
            name="risk-filter"
            onChange={(event) => updateParam("risk", event.target.value)}
            value={risk}
          >
            {["Todos", "Bajo", "Medio", "Alto"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead>Riesgo</TableHead>
              <TableHead>Última visita</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <div className="min-w-0">
                    <Link className="font-medium hover:underline" href={`/dashboard/patients/${patient.id}`}>
                      {patient.name}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">{patient.email}</p>
                  </div>
                </TableCell>
                <TableCell className="min-w-52">{patient.condition}</TableCell>
                <TableCell>
                  <Badge variant={riskVariant(patient.risk)}>{patient.risk}</Badge>
                </TableCell>
                <TableCell className="tabular">{dateFormatter.format(new Date(patient.lastVisit))}</TableCell>
                <TableCell>{patient.doctor}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild aria-label={`Ver historial de ${patient.name}`} size="icon-sm" variant="ghost">
                      <Link href={`/dashboard/patients/${patient.id}`}>
                        <FileText aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button aria-label={`Editar ${patient.name}`} onClick={() => toast("Modo edición listo")} size="icon-sm" type="button" variant="ghost">
                      <Edit aria-hidden="true" />
                    </Button>
                    <Button aria-label={`Eliminar ${patient.name}`} onClick={() => toast.error("Acción destructiva requiere confirmación")} size="icon-sm" type="button" variant="ghost">
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {isPending ? "Filtrando…" : "No hay pacientes con esos filtros."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
