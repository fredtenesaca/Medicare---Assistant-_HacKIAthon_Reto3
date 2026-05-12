import type { MedicalAgentResponse, MedicalAgentWebhookPayload } from "@/types/medical-agent";

const WEBHOOK_TIMEOUT_MS = 20_000;
const SHOULD_LOG_AGENT_DEBUG = process.env.NODE_ENV !== "production";

const DEFAULT_AGENT_RESPONSE: MedicalAgentResponse = {
  analysis:
    "La orientación del agente no devolvió contenido estructurado. Te recomendamos validar directamente con el centro más cercano.",
  urgency: "MEDIA",
  specialty: "Medicina general",
  hospitals: [],
  recommendation: "Valida siempre cobertura y copago con tu aseguradora antes de acudir.",
};

export type NormalizedAgentErrorType = "configuration error" | "network error" | "parsing error" | "server error";

export type NormalizedAgentError = {
  type: NormalizedAgentErrorType;
  message: string;
  statusCode?: number;
  isRetryable: boolean;
  shortMessage: string;
  rawBody?: string;
  details?: unknown;
};

type ParseResult = {
  response: MedicalAgentResponse;
  textFound: boolean;
  sourcePath: string;
  reason?: string;
};

class AgentIntegrationError extends Error {
  normalized: NormalizedAgentError;

  constructor(normalized: NormalizedAgentError) {
    super(normalized.shortMessage);
    this.name = "AgentIntegrationError";
    this.normalized = normalized;
  }
}

function preview(value: unknown, maxLength = 1_500): string {
  if (typeof value === "string") return value.slice(0, maxLength);
  try {
    return JSON.stringify(value, null, 2).slice(0, maxLength);
  } catch {
    return String(value).slice(0, maxLength);
  }
}

function readMessageFromBody(body: unknown): string {
  if (!body) return "";
  if (typeof body === "string") return body;
  if (typeof body !== "object") return String(body);

  const obj = body as Record<string, unknown>;
  const message = obj.message ?? obj.error ?? obj.description ?? obj.detail;
  if (typeof message === "string") return message;
  return preview(body);
}

function classifyErrorMessage(message: string, statusCode?: number): NormalizedAgentError {
  const lower = message.toLowerCase();

  if (lower.includes("unused respond to webhook")) {
    return {
      type: "configuration error",
      message,
      statusCode,
      isRetryable: false,
      shortMessage: "El workflow de n8n tiene un nodo Respond to Webhook sin uso o mal configurado.",
    };
  }

  if (lower.includes("webhook-test") || lower.includes("next_public_n8n_webhook") || lower.includes("url válida")) {
    return {
      type: "configuration error",
      message,
      statusCode,
      isRetryable: false,
      shortMessage: message,
    };
  }

  if (lower.includes("html en vez de json") || lower.includes("body vacío") || lower.includes("json inválido")) {
    return {
      type: "parsing error",
      message,
      statusCode,
      isRetryable: false,
      shortMessage: message,
    };
  }

  if (lower.includes("timeout") || lower.includes("cors") || lower.includes("failed to fetch") || lower.includes("network")) {
    return {
      type: "network error",
      message,
      statusCode,
      isRetryable: true,
      shortMessage: message,
    };
  }

  return {
    type: statusCode && statusCode >= 500 ? "server error" : "configuration error",
    message,
    statusCode,
    isRetryable: Boolean(statusCode && statusCode >= 500),
    shortMessage: statusCode ? `n8n respondió HTTP ${statusCode}.` : message,
  };
}

export function normalizeAgentError(error: unknown): NormalizedAgentError {
  if (error instanceof AgentIntegrationError) return error.normalized;

  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      type: "network error",
      message: `Timeout consultando n8n después de ${WEBHOOK_TIMEOUT_MS}ms.`,
      isRetryable: true,
      shortMessage: `Timeout consultando n8n después de ${WEBHOOK_TIMEOUT_MS}ms.`,
    };
  }

  if (error instanceof TypeError) {
    return {
      type: "network error",
      message: error.message,
      isRetryable: true,
      shortMessage: `Error de red o CORS consultando n8n: ${error.message}`,
    };
  }

  if (error instanceof Error) {
    return classifyErrorMessage(error.message);
  }

  return classifyErrorMessage(String(error));
}

function getWebhookUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK?.trim();

  if (!rawUrl) {
    throw new AgentIntegrationError({
      type: "configuration error",
      message: "NEXT_PUBLIC_N8N_WEBHOOK no está definida. Crea .env.local con la URL del webhook de producción.",
      isRetryable: false,
      shortMessage: "NEXT_PUBLIC_N8N_WEBHOOK no está definida.",
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AgentIntegrationError({
      type: "configuration error",
      message: `NEXT_PUBLIC_N8N_WEBHOOK no es una URL válida: ${rawUrl}`,
      isRetryable: false,
      shortMessage: "NEXT_PUBLIC_N8N_WEBHOOK no es una URL válida.",
    });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AgentIntegrationError({
      type: "configuration error",
      message: `NEXT_PUBLIC_N8N_WEBHOOK debe usar http o https. Protocolo recibido: ${parsed.protocol}`,
      isRetryable: false,
      shortMessage: "NEXT_PUBLIC_N8N_WEBHOOK debe usar http o https.",
    });
  }

  if (parsed.pathname.includes("webhook-test")) {
    throw new AgentIntegrationError({
      type: "configuration error",
      message:
        "NEXT_PUBLIC_N8N_WEBHOOK apunta a webhook-test. Usa /webhook/... para producción o deja el workflow en modo escucha mientras pruebas.",
      isRetryable: false,
      shortMessage: "NEXT_PUBLIC_N8N_WEBHOOK apunta a webhook-test.",
    });
  }

  return rawUrl;
}

function normalizeText(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\t/g, " ").trim();
}

function firstCapture(text: string, pattern: RegExp, fallback = ""): string {
  const match = text.match(pattern);
  return match?.[1]?.trim() ?? fallback;
}

function parseNumberFromText(value: string): number | undefined {
  const numeric = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseHospitalSection(section: string): MedicalAgentResponse["hospitals"] {
  if (!section) return [];

  return section
    .split(/\n(?=\d+\.|•|\*|-)\s*/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const lines = chunk
        .split(/\n|;/)
        .map((line) => line.trim())
        .filter(Boolean);
      const hospital: Record<string, string> = {};

      for (const line of lines) {
        const [label, ...rest] = line.split(/:\s*/);
        if (!label || rest.length === 0) continue;
        const key = label.toLowerCase().replace(/[^a-záéíóúñü]+/gi, "");
        hospital[key] = rest.join(": ").trim();
      }

      const nameLine = lines[0] ?? "";
      const name = hospital.nombre || hospital.hospital || nameLine.replace(/^\d+\.?\s*/, "").split(/-\s*/)[0].trim();

      return {
        id: `${name || "hospital"}-${index}`,
        name: name || `Hospital ${index + 1}`,
        address: hospital.direccion || hospital.dirección || "Dirección no disponible",
        distanceKm: parseNumberFromText(hospital.distancia || ""),
        copago: hospital.copago || hospital.costo || "No disponible",
        coverage: hospital.cobertura || hospital.coberturadetuplan || "No disponible",
        specialty: hospital.especialidad || "",
      };
    })
    .filter((hospital) => hospital.name);
}

function getCaseInsensitive(obj: Record<string, unknown>, key: string): unknown {
  if (key in obj) return obj[key];
  const foundKey = Object.keys(obj).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
  return foundKey ? obj[foundKey] : undefined;
}

function findTextCandidate(value: unknown, path = "$", depth = 0): { text?: string; path: string } {
  if (depth > 8) return { path, text: undefined };

  if (typeof value === "string" && value.trim()) {
    return { path, text: value.trim() };
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findTextCandidate(value[index], `${path}[${index}]`, depth + 1);
      if (found.text) return found;
    }
    return { path, text: undefined };
  }

  if (!value || typeof value !== "object") return { path, text: undefined };

  const obj = value as Record<string, unknown>;
  const preferredKeys = ["output", "response", "text", "message", "answer", "result", "content", "body", "data"];

  for (const key of preferredKeys) {
    const nested = getCaseInsensitive(obj, key);
    if (nested === undefined || nested === null) continue;
    const found = findTextCandidate(nested, `${path}.${key}`, depth + 1);
    if (found.text) return found;
  }

  for (const [key, nested] of Object.entries(obj)) {
    const found = findTextCandidate(nested, `${path}.${key}`, depth + 1);
    if (found.text) return found;
  }

  return { path, text: undefined };
}

function mapHospitalObject(item: Record<string, unknown>, index: number): MedicalAgentResponse["hospitals"][number] {
  const name = String(item.name ?? item.nombre ?? item.hospital ?? `Hospital ${index + 1}`);
  return {
    id: String(item.id ?? name ?? `hospital-${index}`),
    name,
    address: String(item.address ?? item.direccion ?? item.dirección ?? "Dirección no disponible"),
    distanceKm:
      typeof item.distanceKm === "number"
        ? item.distanceKm
        : parseNumberFromText(String(item.distance ?? item.distancia ?? "")),
    copago: String(item.copago ?? item.cost ?? item.costo ?? "No disponible"),
    coverage: String(item.coverage ?? item.cobertura ?? "No disponible"),
    phone: item.phone ? String(item.phone) : undefined,
    specialty: String(item.specialty ?? item.especialidad ?? ""),
  };
}

function parseStructuredObject(raw: Record<string, unknown>, textFallback?: string): MedicalAgentResponse {
  const stringField = (keys: string[], fallback = "") => {
    for (const key of keys) {
      const value = getCaseInsensitive(raw, key);
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number") return String(value);
    }
    return fallback;
  };

  const hospitalsValue =
    getCaseInsensitive(raw, "hospitals") ??
    getCaseInsensitive(raw, "hospitales") ??
    getCaseInsensitive(raw, "hospitales_sugeridos") ??
    getCaseInsensitive(raw, "hospitales_recomendados") ??
    getCaseInsensitive(raw, "centros") ??
    getCaseInsensitive(raw, "centros_medicos");

  const hospitals = Array.isArray(hospitalsValue)
    ? hospitalsValue.map((item, index) => {
        if (typeof item === "string") {
          const [name, ...rest] = item.split("|");
          return {
            id: `${name.trim() || "hospital"}-${index}`,
            name: name.trim() || `Hospital ${index + 1}`,
            address: rest.join("|").trim() || "Dirección no disponible",
            copago: "No disponible",
            coverage: "No disponible",
          };
        }
        if (item && typeof item === "object") return mapHospitalObject(item as Record<string, unknown>, index);
        return {
          id: `hospital-${index}`,
          name: String(item),
          address: "Dirección no disponible",
          copago: "No disponible",
          coverage: "No disponible",
        };
      })
    : [];

  return {
    analysis: stringField(
      ["analysis", "analisis", "análisis", "Analisis de Salud", "Análisis de Salud", "medical_analysis"],
      textFallback || DEFAULT_AGENT_RESPONSE.analysis,
    ),
    urgency: stringField(["urgency", "Urgencia", "Gravedad", "severity", "nivel_urgencia"], DEFAULT_AGENT_RESPONSE.urgency).toUpperCase(),
    specialty: stringField(
      ["specialty", "Especialidad Recomendada", "especialidad", "specialization", "especialidad_recomendada", "recommended_specialty"],
      DEFAULT_AGENT_RESPONSE.specialty,
    ),
    hospitals,
    costBase: stringField(["costBase", "Costo Base", "costo base", "costo_base", "base_cost"], undefined),
    coverage: stringField(["coverage", "Cobertura de tu Plan", "cobertura", "plan_coverage"], undefined),
    copago: stringField(["copago", "Tu Copago Final", "copago final", "copago_final", "final_copay"], undefined),
    recommendation: stringField(["recommendation", "Recomendación", "recomendacion", "final_recommendation"], DEFAULT_AGENT_RESPONSE.recommendation),
  };
}

function parseTextResponse(rawText: string): MedicalAgentResponse {
  const body = normalizeText(rawText);
  const analysis = firstCapture(
    body,
    /An[áa]lisis de Salud:\s*([\s\S]*?)(?=Urgencia:|Especialidad Recomendada:|Hospitales Sugeridos:|Costo Base:|Cobertura de tu Plan:|Tu Copago Final:|Recomendaci[óo]n:|$)/i,
    body || DEFAULT_AGENT_RESPONSE.analysis,
  );

  return {
    analysis,
    urgency: firstCapture(body, /Urgencia:\s*([A-ZÀ-Ýa-záéíóúñü]+)/i, DEFAULT_AGENT_RESPONSE.urgency).toUpperCase(),
    specialty: firstCapture(
      body,
      /Especialidad Recomendada:\s*([\s\S]*?)(?=Urgencia:|Hospitales Sugeridos:|Costo Base:|Cobertura de tu Plan:|Tu Copago Final:|Recomendaci[óo]n:|$)/i,
      DEFAULT_AGENT_RESPONSE.specialty,
    ),
    hospitals: parseHospitalSection(
      firstCapture(body, /Hospitales Sugeridos:\s*([\s\S]*?)(?=Costo Base:|Cobertura de tu Plan:|Tu Copago Final:|Recomendaci[óo]n:|$)/i, ""),
    ),
    costBase: firstCapture(body, /Costo Base:\s*([\s\S]*?)(?=Cobertura de tu Plan:|Tu Copago Final:|Recomendaci[óo]n:|$)/i, undefined),
    coverage: firstCapture(body, /Cobertura de tu Plan:\s*([\s\S]*?)(?=Tu Copago Final:|Recomendaci[óo]n:|$)/i, undefined),
    copago: firstCapture(body, /Tu Copago Final:\s*([\s\S]*?)(?=Recomendaci[óo]n:|$)/i, undefined),
    recommendation: firstCapture(body, /Recomendaci[óo]n:\s*([\s\S]*?)(?=$)/i, DEFAULT_AGENT_RESPONSE.recommendation),
  };
}

function parseAgentResponse(raw: unknown): ParseResult {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return {
        response: DEFAULT_AGENT_RESPONSE,
        textFound: false,
        sourcePath: "$",
        reason: "La respuesta llegó como texto vacío.",
      };
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return parseAgentResponse(JSON.parse(trimmed));
      } catch {
        return {
          response: parseTextResponse(trimmed),
          textFound: true,
          sourcePath: "$",
          reason: "JSON inválido procesado como texto plano.",
        };
      }
    }

    return {
      response: parseTextResponse(trimmed),
      textFound: true,
      sourcePath: "$",
    };
  }

  const textCandidate = findTextCandidate(raw);

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const objectResponse = parseStructuredObject(raw as Record<string, unknown>, textCandidate.text);
    return {
      response: textCandidate.text ? { ...parseTextResponse(textCandidate.text), ...objectResponse } : objectResponse,
      textFound: Boolean(textCandidate.text || objectResponse.analysis !== DEFAULT_AGENT_RESPONSE.analysis),
      sourcePath: textCandidate.path,
      reason: textCandidate.text ? undefined : "No se encontró output/response/text/message ni campos médicos reconocidos.",
    };
  }

  if (textCandidate.text) {
    return {
      response: parseTextResponse(textCandidate.text),
      textFound: true,
      sourcePath: textCandidate.path,
    };
  }

  return {
    response: DEFAULT_AGENT_RESPONSE,
    textFound: false,
    sourcePath: "$",
    reason: `Tipo de respuesta no soportado: ${Array.isArray(raw) ? "array vacío/sin texto" : typeof raw}.`,
  };
}

function parseBodySafely(text: string, contentType: string): { parsed: unknown; parseError?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { parsed: "", parseError: "Webhook respondió body vacío." };

  if (/^\s*(<!doctype html|<html)/i.test(trimmed)) {
    return {
      parsed: trimmed,
      parseError: `Webhook respondió HTML en vez de JSON/texto. Body: ${trimmed.slice(0, 180)}`,
    };
  }

  try {
    return { parsed: JSON.parse(trimmed) };
  } catch (error) {
    if (contentType.toLowerCase().includes("application/json")) {
      return {
        parsed: trimmed,
        parseError: `JSON inválido recibido desde n8n: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    return { parsed: trimmed };
  }
}

function buildHttpError(statusCode: number, statusText: string, rawBody: string, parsedBody: unknown): AgentIntegrationError {
  const bodyMessage = readMessageFromBody(parsedBody) || rawBody || statusText;
  const normalized = classifyErrorMessage(bodyMessage, statusCode);

  return new AgentIntegrationError({
    ...normalized,
    rawBody,
    details: parsedBody,
    message: bodyMessage,
  });
}

export async function consultarAgenteMedico(payload: MedicalAgentWebhookPayload): Promise<MedicalAgentResponse> {
  const url = getWebhookUrl();
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const durationMs = Math.round(performance.now() - startTime);
    const headers = Object.fromEntries(response.headers.entries());
    const contentType = response.headers.get("content-type") || "sin content-type";
    const rawText = await response.text();
    const { parsed, parseError } = parseBodySafely(rawText, contentType);

    if (SHOULD_LOG_AGENT_DEBUG) {
      console.groupCollapsed(`📡 n8n webhook ${response.status} ${response.statusText} (${durationMs}ms)`);
      console.log("URL:", url);
      console.log("Payload:", payload);
      console.log("Headers:", headers);
      console.log("Raw response:", rawText || "[respuesta vacía]");
      if (parseError) console.warn("Parse warning:", parseError);
      else console.log("Parsed response:", parsed);
      console.groupEnd();
    }

    if (!response.ok) {
      throw buildHttpError(response.status, response.statusText, rawText, parsed);
    }

    if (parseError) {
      throw new AgentIntegrationError({
        type: "parsing error",
        message: parseError,
        statusCode: response.status,
        isRetryable: false,
        shortMessage: parseError,
        rawBody: rawText,
      });
    }

    const parsedResult = parseAgentResponse(parsed);

    if (SHOULD_LOG_AGENT_DEBUG) {
      console.groupCollapsed("✅ n8n response mapped");
      console.log("Text source:", parsedResult.textFound ? parsedResult.sourcePath : "not found");
      console.log("Mapped data:", parsedResult.response);
      if (!parsedResult.textFound) console.warn("Parser fallback reason:", parsedResult.reason);
      console.groupEnd();
    }

    return parsedResult.response;
  } catch (error) {
    throw new AgentIntegrationError(normalizeAgentError(error));
  } finally {
    clearTimeout(timeoutId);
  }
}
