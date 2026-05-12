"use client";

import { FileDown, Mail, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import type { ConsultPdfPayload } from "@/lib/pdf/consult-pdf";
import { buildConsultShareText, downloadConsultOrientationPdf, shareConsultOrientationPdf } from "@/lib/pdf/consult-pdf";

export function TicketActions({ consultPayload }: { consultPayload: ConsultPdfPayload }) {
  const onPdf = async () => {
    try {
      await downloadConsultOrientationPdf(consultPayload);
      toast.success("PDF descargado");
    } catch {
      toast.error("No se pudo generar el PDF");
    }
  };

  const onShare = async (target: "whatsapp" | "email") => {
    try {
      const shared = await shareConsultOrientationPdf(consultPayload);
      if (shared) {
        toast.success("PDF listo para compartir");
        return;
      }
      toast("PDF descargado. Adjuntalo en la app que se abrirá.");
    } catch {
      toast.error("No se pudo preparar el PDF");
      return;
    }

    const body = encodeURIComponent(buildConsultShareText(consultPayload));
    if (target === "whatsapp") {
      window.open(`https://wa.me/?text=${body}`, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = `mailto:?subject=${encodeURIComponent("Resumen Medicare Assistant")}&body=${body}`;
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap print:hidden">
      <Button className="h-9 rounded-lg px-4 text-sm" onClick={() => void onPdf()} type="button">
        <FileDown aria-hidden="true" />
        Descargar PDF
      </Button>
      <Button className="h-9 rounded-lg px-4 text-sm" onClick={() => void onShare("whatsapp")} type="button" variant="outline">
        <MessageCircle aria-hidden="true" />
        WhatsApp
      </Button>
      <Button className="h-9 rounded-lg px-4 text-sm" onClick={() => void onShare("email")} type="button" variant="outline">
        <Mail aria-hidden="true" />
        Email
      </Button>
    </div>
  );
}
