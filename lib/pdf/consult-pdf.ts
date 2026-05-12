"use client";

import { getHospitalRecomendado } from "@/lib/medical-orientation";
import { getSelectedHospitalFromStore } from "@/lib/stores/assistant-chat-store";
import type { HospitalOption, MockCitizen } from "@/types/patient-assistant";

export type ConsultPdfPayload = {
  patient: MockCitizen;
  symptoms: string[];
  suggestedSpecialty: string;
  selectedHospital: HospitalOption | null;
  closestHospital: HospitalOption | null;
  cheapestHospital: HospitalOption | null;
  locationLabel: string;
};

export function buildConsultPdfPayload(params: {
  patient: MockCitizen;
  symptoms: string[];
  suggestedSpecialty: string;
  nearbyHospitalOptions: HospitalOption[];
  selectedHospitalId: string | null;
  locationLabel: string;
}): ConsultPdfPayload {
  const { masCercano, masEconomico } = getHospitalRecomendado(params.nearbyHospitalOptions);
  const selected = getSelectedHospitalFromStore(params.nearbyHospitalOptions, params.selectedHospitalId);
  return {
    patient: params.patient,
    symptoms: params.symptoms,
    suggestedSpecialty: params.suggestedSpecialty,
    selectedHospital: selected,
    closestHospital: masCercano ?? selected,
    cheapestHospital: masEconomico ?? selected,
    locationLabel: params.locationLabel,
  };
}

const formatMoney = (value?: number) => (typeof value === "number" ? `$${value.toFixed(2)} USD` : "No disponible");

function filenameForPatient(name: string) {
  const safeName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 42);
  return `medicare-assistant-${safeName || "paciente"}.pdf`;
}

function cleanAddress(address?: string) {
  if (!address) return "Dirección referencial no disponible";
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(address.trim())) {
    return "Dirección referencial no disponible";
  }
  return address;
}

export async function createConsultOrientationPdfBlob(payload: ConsultPdfPayload): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  const hospital = payload.selectedHospital;
  let y = 0;

  const ink: [number, number, number] = [15, 23, 42];
  const muted: [number, number, number] = [91, 106, 128];
  const line: [number, number, number] = [226, 232, 240];
  const primary: [number, number, number] = [21, 128, 108];
  const soft: [number, number, number] = [241, 248, 246];

  const text = (
    value: string,
    x: number,
    yy: number,
    opts?: { size?: number; bold?: boolean; color?: [number, number, number]; maxW?: number },
  ) => {
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.size ?? 9);
    doc.setTextColor(...(opts?.color ?? muted));
    const lines = opts?.maxW ? doc.splitTextToSize(value, opts.maxW) : [value];
    doc.text(lines.slice(0, 3), x, yy);
    return lines.slice(0, 3).length;
  };

  const sectionTitle = (title: string) => {
    text(title, margin, y, { size: 10.5, bold: true, color: ink });
    y += 3;
    doc.setDrawColor(...line);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  };

  const card = (x: number, yy: number, w: number, h: number, fill: [number, number, number] = [248, 250, 252]) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...line);
    doc.roundedRect(x, yy, w, h, 2, 2, "FD");
  };

  const kv = (label: string, value: string, x: number, yy: number, w: number, h = 18) => {
    card(x, yy, w, h);
    text(label.toUpperCase(), x + 3, yy + 5, { size: 6.8, bold: true, color: muted });
    text(value, x + 3, yy + 10.5, { size: 8.6, bold: true, color: ink, maxW: w - 6 });
  };

  doc.setFillColor(...ink);
  doc.rect(0, 0, pageW, 34, "F");
  doc.setFillColor(...primary);
  doc.roundedRect(margin, 10, 10, 10, 2, 2, "F");
  text("MA", margin + 2.1, 16.7, { size: 7, bold: true, color: [255, 255, 255] });
  text("Medicare Assistant", margin + 14, 14.5, { size: 16, bold: true, color: [255, 255, 255] });
  text("Reporte de pre-orientación médica", margin + 14, 22, { size: 8.5, color: [203, 213, 225] });
  text("PRE-ORIENTACIÓN MÉDICA", pageW - margin - 57, 15, { size: 7.6, bold: true, color: [209, 250, 229] });
  text(new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date()), pageW - margin - 50, 22, {
    size: 7.8,
    color: [203, 213, 225],
  });

  y = 45;
  sectionTitle("Paciente");
  const col = (contentW - 5) / 2;
  kv("Nombre", payload.patient.name, margin, y, col);
  kv("Cédula", payload.patient.idNumber, margin + col + 5, y, col);
  y += 22;
  kv("Tipo de cobertura / plan", payload.patient.insurance, margin, y, col);
  kv("Estado", "Pre-orientación médica", margin + col + 5, y, col);

  y += 30;
  sectionTitle("Consulta reportada");
  kv("Síntomas ingresados", payload.symptoms.join(", ") || "No especificado", margin, y, contentW, 19);
  y += 23;
  kv("Especialidad sugerida", payload.suggestedSpecialty || hospital?.specialty || "Medicina general", margin, y, contentW, 19);

  y += 30;
  sectionTitle("Hospital seleccionado");
  if (hospital) {
    card(margin, y, contentW, 60, soft);
    text(hospital.name, margin + 4, y + 8, { size: 12, bold: true, color: ink, maxW: contentW - 8 });
    text(cleanAddress(hospital.address), margin + 4, y + 16, { size: 8.5, color: muted, maxW: contentW - 8 });

    const third = (contentW - 8) / 3;
    kv("Distancia", `${hospital.distanceKm.toFixed(1)} km`, margin + 4, y + 24, third, 17);
    kv("Tiempo estimado", hospital.estimatedTime, margin + 4 + third + 4, y + 24, third, 17);
    kv("Costo estimado", formatMoney(hospital.estimatedCost), margin + 4 + (third + 4) * 2, y + 24, third, 17);
    text("Cobertura", margin + 4, y + 49, { size: 7, bold: true, color: muted });
    text(hospital.coverageEstimate ?? payload.patient.insurance, margin + 24, y + 49, {
      size: 8.3,
      color: ink,
      maxW: contentW - 30,
    });
  } else {
    kv("Hospital", "No seleccionado", margin, y, contentW, 18);
  }

  y += 74;
  sectionTitle("Recomendaciones generales");
  card(margin, y, contentW, 30);
  text(
    "Confirma disponibilidad, cobertura y copago con el centro y tu aseguradora antes de acudir. Si presentas una urgencia vital, busca atención de emergencia inmediata.",
    margin + 4,
    y + 8,
    { size: 8.5, color: muted, maxW: contentW - 8 },
  );

  doc.setDrawColor(...line);
  doc.line(margin, pageH - 18, pageW - margin, pageH - 18);
  text("Este documento no representa un diagnóstico médico.", margin, pageH - 11, {
    size: 8,
    bold: true,
    color: muted,
  });
  text("Medicare Assistant · Documento informativo", pageW - margin - 62, pageH - 11, {
    size: 7.8,
    color: muted,
  });

  return doc.output("blob");
}

export async function downloadConsultOrientationPdf(payload: ConsultPdfPayload): Promise<void> {
  const blob = await createConsultOrientationPdfBlob(payload);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filenameForPatient(payload.patient.name);
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function shareConsultOrientationPdf(payload: ConsultPdfPayload): Promise<boolean> {
  const blob = await createConsultOrientationPdfBlob(payload);
  const file = new File([blob], filenameForPatient(payload.patient.name), { type: "application/pdf" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
    await nav.share({
      title: "Resumen Medicare Assistant",
      text: buildConsultShareText(payload),
      files: [file],
    });
    return true;
  }

  await downloadConsultOrientationPdf(payload);
  return false;
}

export function buildConsultShareText(payload: ConsultPdfPayload): string {
  const hospital = payload.selectedHospital;
  const lines = [
    "Medicare Assistant - Pre-orientación médica",
    `Paciente: ${payload.patient.name}`,
    `Cédula: ${payload.patient.idNumber}`,
    `Síntomas reportados: ${payload.symptoms.join(", ") || "No especificado"}`,
    `Especialidad sugerida: ${payload.suggestedSpecialty}`,
    hospital ? `Hospital seleccionado: ${hospital.name}` : "",
    hospital ? `Dirección: ${cleanAddress(hospital.address)}` : "",
    hospital ? `Copago estimado: ${formatMoney(hospital.estimatedCost)}` : "",
    "",
    "Este documento no representa un diagnóstico médico.",
  ];
  return lines.filter(Boolean).join("\n");
}
