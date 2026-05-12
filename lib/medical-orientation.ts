/**
 * Agente de orientación (no diagnóstico): especialidad sugerida, hospitales cercanos OSM,
 * estimaciones de copago/cobertura y recomendaciones.
 */

import type { HospitalOption } from "@/types/patient-assistant";
import { inferSpecialtyFromSymptoms } from "@/lib/assistant-chat-logic";
import { nearbyHospitals as demoHospitals } from "@/lib/patient-assistant-data";

export type EspecialidadOrientacion = {
  especialidad: string;
  resumenConversacional: string;
};

/** Orientación por síntomas — no es diagnóstico clínico. */
export function getEspecialidad(symptoms: string[]): EspecialidadOrientacion {
  const { specialty, summary } = inferSpecialtyFromSymptoms(symptoms);
  return {
    especialidad: specialty,
    resumenConversacional: summary,
  };
}

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string | undefined>;
};

type OverpassResponse = { elements?: OverpassElement[] };

const EARTH_R_KM = 6371;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_R_KM * c;
}

/** Copago estimado mock inteligente según distancia y tipo de orientación (no cotización real). */
export function calcularCopago(params: {
  distanceKm: number;
  specialtyHint: string;
  insuranceLabel: string;
}): number {
  let base = 28 + Math.min(22, params.distanceKm * 3.2);
  if (/Cardio|Neuro|Trauma/i.test(params.specialtyHint)) base += 12;
  if (/PlusCare|premium|privado/i.test(params.insuranceLabel)) base *= 0.82;
  if (/público|IESS|MSP/i.test(params.insuranceLabel)) base *= 0.65;
  return Math.round(base);
}

/** Texto orientativo de cobertura (no garantía contractual). */
export function getCoberturaSeguro(insuranceLabel: string): string {
  const t = insuranceLabel.toLowerCase();
  if (/plus|premium|privado/.test(t)) return "Estimación: copago preferencial / red amplia (verificar póliza).";
  if (/iess|público|msp|social/.test(t)) return "Estimación: cobertura institucional sujeta a cupos y normativa local.";
  return "Estimación: revisar deducible y red del plan en tu póliza.";
}

function pickCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") return { lat: el.lat, lon: el.lon };
  if (el.center && typeof el.center.lat === "number" && typeof el.center.lon === "number") {
    return { lat: el.center.lat, lon: el.center.lon };
  }
  return null;
}

function hospitalName(tags: Record<string, string | undefined> | undefined): string {
  if (!tags) return "Centro de salud";
  return (
    tags.name ??
    tags["name:es"] ??
    tags["name:en"] ??
    tags.operator ??
    tags.official_name ??
    "Centro de salud"
  );
}

function formatAddress(tags: Record<string, string | undefined> | undefined): string {
  if (!tags) return "";
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const parts = [
    street,
    tags["addr:suburb"] ?? tags["addr:neighbourhood"] ?? tags["addr:quarter"],
    tags["addr:city"] ?? tags["addr:town"] ?? tags["addr:municipality"],
    tags["addr:state"],
  ].filter(Boolean);
  return parts.join(", ") || "";
}

function isCoordinateAddress(address: string): boolean {
  return /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(address.trim());
}

async function reverseAddress(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "MedicareAssistant/1.0 (OSM education demo)",
        },
      },
    );
    if (!response.ok) return "";
    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string | undefined>;
    };
    const a = data.address;
    const road = [a?.road ?? a?.pedestrian ?? a?.residential ?? a?.footway, a?.house_number].filter(Boolean).join(" ");
    const area = a?.suburb ?? a?.neighbourhood ?? a?.quarter ?? a?.city_district;
    const city = a?.city ?? a?.town ?? a?.village ?? a?.municipality ?? a?.county;
    const readable = [road, area, city].filter(Boolean).join(", ");
    return readable || data.display_name?.split(",").slice(0, 3).join(", ") || "";
  } catch {
    return "";
  }
}

export async function enrichHospitalAddresses(options: HospitalOption[]): Promise<HospitalOption[]> {
  const top = await Promise.all(
    options.slice(0, 8).map(async (option) => {
      if (!option.lat || !option.lon || (option.address && !isCoordinateAddress(option.address))) {
        return option;
      }
      const address = await reverseAddress(option.lat, option.lon);
      return { ...option, address: address || "Dirección referencial no disponible" };
    }),
  );
  return [...top, ...options.slice(8)];
}

/** Hospitales reales vía Overpass (OpenStreetMap). Devuelve lista vacía si falla la red. */
export async function getHospitalesCercanos(params: {
  lat: number;
  lon: number;
  radiusMeters?: number;
}): Promise<
  Array<{
    id: string;
    name: string;
    lat: number;
    lon: number;
    address: string;
    specialtyTag?: string;
  }>
> {
  const r = params.radiusMeters ?? 100_000;
  const q = `
[out:json][timeout:28];
(
  node["amenity"="hospital"](around:${r},${params.lat},${params.lon});
  node["healthcare"="hospital"](around:${r},${params.lat},${params.lon});
  node["amenity"="clinic"](around:${r},${params.lat},${params.lon});
  node["healthcare"="clinic"](around:${r},${params.lat},${params.lon});
  way["amenity"="hospital"](around:${r},${params.lat},${params.lon});
  way["healthcare"="hospital"](around:${r},${params.lat},${params.lon});
  way["amenity"="clinic"](around:${r},${params.lat},${params.lon});
  way["healthcare"="clinic"](around:${r},${params.lat},${params.lon});
);
out center tags;
`.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "MedicareAssistant/1.0 (OSM education demo)",
      },
      body: `data=${encodeURIComponent(q)}`,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as OverpassResponse;
    const elements = data.elements ?? [];
    const out: Array<{ id: string; name: string; lat: number; lon: number; address: string; specialtyTag?: string }> =
      [];

    const seen = new Set<string>();
    for (const el of elements) {
      const coords = pickCoords(el);
      if (!coords) continue;
      const tags = el.tags;
      const name = hospitalName(tags);
      const key = `${name}-${coords.lat.toFixed(4)}-${coords.lon.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: `osm-${el.type}-${el.id}`,
        name,
        lat: coords.lat,
        lon: coords.lon,
        address: formatAddress(tags),
        specialtyTag: tags?.["healthcare:speciality"] ?? tags?.healthcare,
      });
    }
    out.sort(
      (a, b) =>
        haversineKm(params.lat, params.lon, a.lat, a.lon) - haversineKm(params.lat, params.lon, b.lat, b.lon),
    );
    return out.slice(0, 16);
  } catch {
    return [];
  }
}

/** Convierte resultados OSM + perfil del usuario en opciones comparables del chat. */
export function mapOsmResultsToHospitalOptions(params: {
  userLat: number;
  userLon: number;
  raw: Array<{ id: string; name: string; lat: number; lon: number; address: string; specialtyTag?: string }>;
  suggestedSpecialty: string;
  insuranceLabel: string;
}): HospitalOption[] {
  return params.raw.map((h, index) => {
    const distanceKm = haversineKm(params.userLat, params.userLon, h.lat, h.lon);
    const specialty =
      h.specialtyTag?.replace(/;/g, ", ") ?? `${params.suggestedSpecialty} · consulta inicial`;
    const estimatedCost = calcularCopago({
      distanceKm,
      specialtyHint: params.suggestedSpecialty,
      insuranceLabel: params.insuranceLabel,
    });
    const estimatedMinutes = Math.max(8, Math.round((distanceKm / 22) * 60));
    const coverage = getCoberturaSeguro(params.insuranceLabel);

    return {
      id: h.id,
      name: h.name,
      specialty,
      distanceKm,
      estimatedCost,
      estimatedTime: `${estimatedMinutes} min`,
      rating: 4.2 + ((index * 7) % 8) / 10,
      aiRecommendation: `Orientación: centro OSM a ${distanceKm.toFixed(1)} km. ${coverage}`,
      address: h.address || "Dirección referencial no disponible",
      coverageEstimate: coverage,
      lat: h.lat,
      lon: h.lon,
      source: "osm",
    };
  });
}

/** Combina datos reales con demo si hay pocos resultados (zonas con poca cartografía). */
export function mergeWithDemoIfSparse(
  osmOptions: HospitalOption[],
  suggestedSpecialty: string,
  insuranceLabel: string,
): HospitalOption[] {
  if (osmOptions.length >= 2) return osmOptions.slice(0, 8);
  const seeded = osmOptions.length ? [...osmOptions] : [];
  const cov = getCoberturaSeguro(insuranceLabel);
  for (const d of demoHospitals) {
    seeded.push({
      ...d,
      specialty: `${suggestedSpecialty} · ${d.specialty}`,
      coverageEstimate: cov,
      source: "demo",
    });
  }
  return seeded.slice(0, 8);
}

export function getHospitalRecomendado(options: HospitalOption[]): {
  masCercano: HospitalOption;
  masEconomico: HospitalOption;
} {
  if (!options.length) {
    const fallback = demoHospitals[0];
    return { masCercano: fallback, masEconomico: fallback };
  }
  const masCercano = options.reduce((a, b) => (a.distanceKm <= b.distanceKm ? a : b));
  const masEconomico = options.reduce((a, b) => (a.estimatedCost <= b.estimatedCost ? a : b));
  return { masCercano, masEconomico };
}
