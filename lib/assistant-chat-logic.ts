import type { AssistantChatMessageItem, AssistantLocationState, AssistantMessageKind } from "@/lib/assistant-chat-types";
import type { MedicalAgentResponse } from "@/types/medical-agent";

export const fallbackLocation: AssistantLocationState = {
  lat: -2.17,
  lon: -79.9,
  label: "Guayaquil, Guayas, Ecuador",
  city: "Guayaquil",
  province: "Guayas",
};

export const initialAssistantMessages: AssistantChatMessageItem[] = [
  {
    id: "welcome",
    role: "bot",
    kind: "text",
    content:
      "Hola, soy tu agente de orientación en beneficios y ubicación médica. No diagnostico enfermedades: te ayudo a priorizar especialidad sugerida, centros cercanos y copagos estimados.",
  },
  {
    id: "ask-id",
    role: "bot",
    kind: "text",
    content: "Para comenzar, por favor ingresa tu número de cédula.",
  },
];

/** Usa `globalThis` para no depender de `window` si el módulo se evalúa fuera del navegador. */
export const sleep = (duration: number) =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, duration);
  });

export async function resolveLocationFromPosition(position: GeolocationPosition): Promise<AssistantLocationState> {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "MedicareAssistant/1.0 (education demo; +https://example.invalid)",
        },
      },
    );
    const data = (await response.json()) as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        state?: string;
        province?: string;
      };
    };
    const city =
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.municipality ??
      data.address?.county;
    const province = data.address?.state ?? data.address?.province;
    const shortLabel = [city, province].filter(Boolean).join(", ");

    return {
      lat,
      lon,
      label: data.display_name ?? (shortLabel || "Ubicación detectada"),
      city,
      province,
    };
  } catch {
    return { lat, lon, label: "Ubicación detectada con OpenStreetMap" };
  }
}

export async function resolveLocationFromQuery(query: string): Promise<AssistantLocationState> {
  const encoded = encodeURIComponent(query.trim());
  if (!encoded) {
    throw new Error("Consulta de ubicación vacía");
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encoded}&limit=1`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "MedicareAssistant/1.0 (education demo; +https://example.invalid)",
      },
    },
  );

  const results = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
    address?: { city?: string; town?: string; village?: string; state?: string; province?: string };
  }>;

  const first = results[0];
  if (!first || typeof first.lat !== "string" || typeof first.lon !== "string") {
    throw new Error("No se encontró la ubicación solicitada.");
  }

  const lat = Number(first.lat);
  const lon = Number(first.lon);
  const city = first.address?.city ?? first.address?.town ?? first.address?.village;
  const province = first.address?.state ?? first.address?.province;
  return {
    lat,
    lon,
    label: first.display_name ?? query,
    city,
    province,
  };
}

export function makeAssistantMessage(
  role: "bot" | "user",
  kind: AssistantMessageKind,
  content?: string | MedicalAgentResponse,
): AssistantChatMessageItem {
  return {
    id: `${role}-${kind}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    kind,
    content,
  };
}

export function inferSpecialtyFromSymptoms(symptoms: string[]): { specialty: string; summary: string } {
  const text = symptoms.join(" ").toLowerCase();
  const rules: [RegExp, string][] = [
    [/cabeza|migraña|cefalea|mareo/, "Neurología"],
    [/pecho|cardio|palpitaci|presión arterial/, "Cardiología"],
    [/respir|tos|asma|pulm/, "Neumología"],
    [/estómago|abdomen|náusea|vómito|digest/, "Gastroenterología"],
    [/piel|erupci|rash|alergia/, "Dermatología"],
    [/articulaci|hueso|muscul|rodilla/, "Traumatología / Ortopedia"],
    [/ojo|vista|visión/, "Oftalmología"],
    [/garganta|oído|sinus|nariz/, "Otorrinolaringología"],
    [/fiebre|gripe|infecci/, "Medicina interna / infectología"],
    [/urge|hemorragia|pérdida de conocimiento/, "Urgencias"],
  ];
  for (const [re, label] of rules) {
    if (re.test(text)) {
      return {
        specialty: label,
        summary: `Con base en lo que comentas, una primera orientación apunta hacia ${label}. Usaré este perfil para priorizar hospitales compatibles.`,
      };
    }
  }
  return {
    specialty: "Medicina general",
    summary:
      "Con la información disponible, orientamos una consulta amplia con medicina general; el centro podrá derivarte si hace falta.",
  };
}
