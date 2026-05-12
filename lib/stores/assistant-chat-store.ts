"use client";

import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  fallbackLocation,
  initialAssistantMessages,
  makeAssistantMessage,
  resolveLocationFromPosition,
  resolveLocationFromQuery,
  sleep,
} from "@/lib/assistant-chat-logic";
import { consultarAgenteMedico, normalizeAgentError } from "@/lib/api/agent";
import {
  enrichHospitalAddresses,
  getEspecialidad,
  getHospitalRecomendado,
  getHospitalesCercanos,
  mapOsmResultsToHospitalOptions,
  mergeWithDemoIfSparse,
} from "@/lib/medical-orientation";
import { mockCitizen } from "@/lib/patient-assistant-data";
import type {
  AssistantChatMessageItem,
  AssistantLocationState,
  AssistantMessageKind,
  AssistantPhase,
} from "@/lib/assistant-chat-types";
import type { HospitalOption } from "@/types/patient-assistant";

type AssistantChatStore = {
  isOpen: boolean;
  isMinimized: boolean;
  phase: AssistantPhase;
  messages: AssistantChatMessageItem[];
  input: string;
  isTyping: boolean;
  location: AssistantLocationState | null;
  selectedSymptoms: string[];
  patientId: string;
  symptomsText: string;
  suggestedSpecialty: string;
  nearbyHospitalOptions: HospitalOption[];
  selectedHospitalId: string | null;
  agentError: string | null;
  comparisonModalOpen: boolean;
  inputFocusNonce: number;

  open: () => void;
  close: () => void;
  toggleMinimized: () => void;
  openChatAndFocusInput: () => void;
  setInput: (value: string) => void;
  bumpInputFocus: () => void;
  resetConversation: () => void;
  resetCurrentFlow: () => void;
  resetStepState: () => void;
  startNewConsultation: (idNumber?: string) => void;
  promptNewConsultation: () => void;
  append: (message: AssistantChatMessageItem) => void;
  appendBot: (content: string, delay?: number) => Promise<void>;
  appendBotCard: (kind: AssistantMessageKind, delay?: number) => Promise<void>;
  submitMessage: () => void;
  requestLocation: () => void;
  toggleSuggestion: (suggestion: string) => void;
  selectHospital: (id: string) => void;
  openComparison: () => void;
  closeComparison: () => void;
};

const nonPersistedDefaults = {
  isOpen: false,
  isMinimized: false,
  isTyping: false,
  input: "",
  comparisonModalOpen: false,
  inputFocusNonce: 0,
};

const SHOULD_LOG_AGENT_DEBUG = process.env.NODE_ENV !== "production";

const newConsultationMessage = () =>
  makeAssistantMessage(
    "bot",
    "text",
    "Hola 👋\nComencemos una nueva consulta médica.\n\nPor favor ingresa tu número de cédula.",
  );

export const useAssistantChatStore = create<AssistantChatStore>()(
  persist(
    (set, get): AssistantChatStore => {
      const append = (message: AssistantChatMessageItem) => {
        set((s) => ({ messages: [...s.messages, message] }));
      };

      const appendBot = async (content: string, delay = 520) => {
        set({ isTyping: true });
        await sleep(delay);
        set({ isTyping: false });
        append(makeAssistantMessage("bot", "text", content));
      };

      const appendBotCard = async (kind: AssistantMessageKind, delay = 520) => {
        set({ isTyping: true });
        await sleep(delay);
        set({ isTyping: false });
        append(makeAssistantMessage("bot", kind));
      };

      const parseNumberFromText = (value: string): number | undefined => {
        const numeric = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
        const parsed = Number(numeric);
        return Number.isFinite(parsed) ? parsed : undefined;
      };

      const processAgentFlow = async (lat: number, lon: number) => {
        const { patientId, symptomsText } = get();
        if (!patientId || !symptomsText) {
          throw new Error("Faltan datos necesarios para consultar el agente médico.");
        }

        await appendBot("Analizando cobertura y hospitales cercanos...", 520);

        try {
          if (SHOULD_LOG_AGENT_DEBUG) {
            console.groupCollapsed("🏥 Medical agent request");
            console.log("Patient ID:", patientId);
            console.log("Symptoms:", symptomsText);
            console.log("Location:", { lat, lon });
            console.groupEnd();
          }

          const startFlow = performance.now();
          const agentResponse = await consultarAgenteMedico({
            paciente_cedula: patientId,
            paciente_sintoma: symptomsText,
            usuario_lat: lat,
            usuario_long: lon,
          });
          const endFlow = performance.now();

          if (SHOULD_LOG_AGENT_DEBUG) {
            console.groupCollapsed("✅ Medical agent response ready");
            console.log("Flow time:", `${(endFlow - startFlow).toFixed(2)}ms`);
            console.log("Analysis length:", agentResponse.analysis.length);
            console.log("Urgency:", agentResponse.urgency);
            console.log("Specialty:", agentResponse.specialty);
            console.log("Hospitals count:", agentResponse.hospitals.length);
            console.groupEnd();
          }

          const mappedHospitals = agentResponse.hospitals.map((hospital, index) => ({
            id: hospital.id || `${hospital.name}-${index}`,
            name: hospital.name,
            specialty: hospital.specialty || get().suggestedSpecialty || "Medicina general",
            address: hospital.address || "Dirección no disponible",
            distanceKm: hospital.distanceKm ?? 0,
            estimatedCost: hospital.copago ? parseNumberFromText(hospital.copago) ?? 0 : 0,
            estimatedTime: hospital.distanceKm ? `${Math.max(10, Math.round(hospital.distanceKm * 4))} min` : "N/A",
            rating: 4.5,
            aiRecommendation: hospital.copago ?? "Copago no disponible",
            coverageEstimate: hospital.coverage,
            lat: undefined,
            lon: undefined,
            source: "demo",
          } as HospitalOption));

          set({
            suggestedSpecialty: agentResponse.specialty || get().suggestedSpecialty,
            nearbyHospitalOptions: mappedHospitals,
            selectedHospitalId: mappedHospitals[0]?.id ?? null,
            agentError: null,
          });

          append(makeAssistantMessage("bot", "agent-results", agentResponse));
          set({ phase: "results" });
        } catch (error) {
          const normalizedError = normalizeAgentError(error);
          const stackLines = error instanceof Error && error.stack
            ? error.stack.split("\n").slice(0, 3)
            : [];

          if (SHOULD_LOG_AGENT_DEBUG) {
            console.groupCollapsed(`❌ Medical agent unavailable - ${normalizedError.type}`);
            console.error(normalizedError.shortMessage);
            console.log("Status code:", normalizedError.statusCode ?? "N/A");
            console.log("Retryable:", normalizedError.isRetryable);
            console.log("Message:", normalizedError.message);
            console.log("Payload:", {
              paciente_cedula: patientId,
              paciente_sintoma: symptomsText,
              usuario_lat: lat,
              usuario_long: lon,
            });
            if (normalizedError.rawBody) console.log("Raw body:", normalizedError.rawBody);
            if (stackLines.length) console.log("Stack:", stackLines.join("\n"));
            console.groupEnd();
          }

          const fallbackMessage = `[Agent Error: ${normalizedError.shortMessage}]`;
          await appendBot("No pudimos consultar el agente médico en este momento. Cargando hospitales de respaldo...");
          set({ agentError: fallbackMessage });
          
          try {
            await loadHospitalsForCoordinates(lat, lon);
          } catch {
            if (SHOULD_LOG_AGENT_DEBUG) console.warn("⚠️ OSM fallback failed, using default location");
            await loadHospitalsForCoordinates(fallbackLocation.lat, fallbackLocation.lon);
            toast("Usamos hospitales de respaldo por un fallo al cargar datos abiertos en tu zona.");
          }
          
          append(makeAssistantMessage("bot", "hospitals"));
          set({ phase: "results" });
        }
      };

      const loadHospitalsForCoordinates = async (lat: number, lon: number) => {
        const specialty = get().suggestedSpecialty || "Medicina general";
        const raw = await getHospitalesCercanos({ lat, lon });
        let mapped = mapOsmResultsToHospitalOptions({
          userLat: lat,
          userLon: lon,
          raw,
          suggestedSpecialty: specialty,
          insuranceLabel: mockCitizen.insurance,
        });
        mapped = await enrichHospitalAddresses(mergeWithDemoIfSparse(mapped, specialty, mockCitizen.insurance));
        const { masCercano } = getHospitalRecomendado(mapped);
        set({
          nearbyHospitalOptions: mapped,
          selectedHospitalId: masCercano?.id ?? mapped[0]?.id ?? null,
        });
      };

      const handleCityLocation = async (locationText: string) => {
        append(makeAssistantMessage("user", "text", locationText));
        set({ input: "", phase: "locating", isTyping: true });
        try {
          const resolved = await resolveLocationFromQuery(locationText);
          set({ location: resolved });
          toast.success("Ubicación manual recibida · analizando hospitales cercanos");
          await processAgentFlow(resolved.lat, resolved.lon);
        } catch {
          set({ location: fallbackLocation, phase: "results", isTyping: false });
          await appendBot("No encontramos esa ubicación exacta. Usamos ubicación general mientras continuamos.");
          try {
            await loadHospitalsForCoordinates(fallbackLocation.lat, fallbackLocation.lon);
          } catch {
            toast("No se pudieron cargar hospitales de respaldo.");
          }
          append(makeAssistantMessage("bot", "hospitals"));
        }
      };

      const findNearbyHospitals = async () => {
        set({ isTyping: true });

        if (typeof window === "undefined" || !("geolocation" in navigator)) {
          set({ isTyping: false, phase: "location-fallback" });
          append(makeAssistantMessage("bot", "text", "No pudimos obtener tu ubicación automáticamente. Por favor ingresa tu ciudad o barrio para continuar."));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            void (async () => {
              try {
                const resolved = await resolveLocationFromPosition(position);
                set({ location: resolved });
                toast.success("Ubicación obtenida · analizando hospitales cercanos");
                await processAgentFlow(resolved.lat, resolved.lon);
              } catch {
                set({ phase: "location-fallback", isTyping: false });
                append(makeAssistantMessage("bot", "text", "No pudimos resolver la dirección en mapas. Ingresa tu ciudad para continuar."));
              }
            })();
          },
          () => {
            set({ phase: "location-fallback", isTyping: false });
            append(makeAssistantMessage("bot", "text", "No se concedió acceso a tu ubicación. Escribe tu ciudad o barrio para continuar."));
          },
          { enableHighAccuracy: true, timeout: 12_000, maximumAge: 120_000 },
        );
      };

      const handleId = async (idNumber: string) => {
        append(makeAssistantMessage("user", "text", idNumber));

        if (idNumber.length < 10) {
          await appendBot("Necesito una cédula de 10 dígitos para continuar.");
          return;
        }

        set({ phase: "validating", isTyping: true, patientId: idNumber });
        await sleep(720);
        set({ isTyping: false });
        append(makeAssistantMessage("bot", "patient"));
        set({ phase: "symptoms" });
        toast.success("Usuario validado");
      };

      const handleSymptoms = async (symptomsText: string) => {
        const parsedSymptoms = symptomsText
          .split(/,| y /i)
          .map((item) => item.trim())
          .filter(Boolean);
        const nextSymptoms = parsedSymptoms.length ? parsedSymptoms : [symptomsText];
        const { especialidad, resumenConversacional } = getEspecialidad(nextSymptoms);
        set({ selectedSymptoms: nextSymptoms, suggestedSpecialty: especialidad, symptomsText });
        append(makeAssistantMessage("user", "text", symptomsText));
        await appendBot(resumenConversacional, 480);
        set({ phase: "location" });
        await appendBotCard("location-action", 380);
      };

      const resetStepState = () => {
        set((s) => ({
          phase: "id",
          input: "",
          isTyping: false,
          location: null,
          patientId: "",
          symptomsText: "",
          selectedSymptoms: [],
          suggestedSpecialty: "Medicina general",
          nearbyHospitalOptions: [],
          selectedHospitalId: null,
          agentError: null,
          comparisonModalOpen: false,
          inputFocusNonce: s.inputFocusNonce + 1,
        }));
      };

      const resetCurrentFlow = () => {
        resetStepState();
      };

      const startNewConsultation = (idNumber?: string) => {
        const nextId = idNumber?.trim();
        set((s) => ({
          phase: "id",
          input: "",
          isTyping: false,
          location: null,
          patientId: "",
          symptomsText: "",
          selectedSymptoms: [],
          suggestedSpecialty: "Medicina general",
          nearbyHospitalOptions: [],
          selectedHospitalId: null,
          agentError: null,
          comparisonModalOpen: false,
          inputFocusNonce: s.inputFocusNonce + 1,
          messages: [...s.messages, newConsultationMessage()],
        }));

        if (nextId) {
          void handleId(nextId);
        }
      };

      return {
        ...nonPersistedDefaults,
        phase: "id",
        messages: initialAssistantMessages,
        location: null,
        patientId: "",
        symptomsText: "",
        selectedSymptoms: [],
        suggestedSpecialty: "Medicina general",
        nearbyHospitalOptions: [],
        selectedHospitalId: null,
        agentError: null,

        open: () => set({ isOpen: true, isMinimized: false }),
        close: () => set({ isOpen: false, isMinimized: false, comparisonModalOpen: false }),
        toggleMinimized: () => set((s) => ({ isMinimized: !s.isMinimized })),
        openChatAndFocusInput: () =>
          set((s) => ({
            isOpen: true,
            isMinimized: false,
            inputFocusNonce: s.inputFocusNonce + 1,
          })),
        bumpInputFocus: () => set((s) => ({ inputFocusNonce: s.inputFocusNonce + 1 })),

        setInput: (value) => set({ input: value }),
        resetConversation: () =>
          set({
            ...nonPersistedDefaults,
            isOpen: true,
            isMinimized: false,
            phase: "id",
            messages: initialAssistantMessages,
            location: null,
            patientId: "",
            symptomsText: "",
            selectedSymptoms: [],
            suggestedSpecialty: "Medicina general",
            nearbyHospitalOptions: [],
            selectedHospitalId: null,
            agentError: null,
          }),
        resetCurrentFlow,
        resetStepState,
        startNewConsultation,
        promptNewConsultation: () =>
          set((s) => ({
            messages: s.messages[s.messages.length - 1]?.kind === "new-consultation-prompt"
              ? s.messages
              : [...s.messages, makeAssistantMessage("bot", "new-consultation-prompt")],
          })),

        append,
        appendBot,
        appendBotCard,

        submitMessage: () => {
          const { phase, input } = get();
          const value = input.trim();
          if (!value) return;
          set({ input: "" });

          if (phase === "id") {
            void handleId(value);
            return;
          }

          if (phase === "symptoms") {
            void handleSymptoms(value);
            return;
          }

          if (phase === "location-fallback") {
            void handleCityLocation(value);
            return;
          }

          if (phase === "results") {
            void startNewConsultation(value);
            return;
          }

          toast("Espera un momento mientras completamos este paso.");
        },

        requestLocation: () => {
          const { phase } = get();
          if (phase !== "location") return;
          set({ phase: "locating" });
          append(makeAssistantMessage("user", "text", "Permitir acceso a mi ubicación"));
          void findNearbyHospitals();
        },

        toggleSuggestion: (suggestion) => {
          const { input } = get();
          const parts = input
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
          const next = parts.includes(suggestion)
            ? parts.filter((item) => item !== suggestion)
            : [...parts, suggestion];
          set({ input: next.join(", ") });
        },

        selectHospital: (id: string) => {
          set((s) => ({
            selectedHospitalId: id,
            messages: s.messages[s.messages.length - 1]?.kind === "final-actions"
              ? s.messages
              : [...s.messages, makeAssistantMessage("bot", "final-actions")],
          }));
          toast.success("Opción guardada");
        },

        openComparison: () => set({ comparisonModalOpen: true }),
        closeComparison: () => set({ comparisonModalOpen: false }),
      };
    },
    {
      name: "medicare-assistant-chat",
      skipHydration: true,
      partialize: (state) => ({
        messages: state.messages,
        phase: state.phase,
        location: state.location,
        selectedSymptoms: state.selectedSymptoms,
        suggestedSpecialty: state.suggestedSpecialty,
        nearbyHospitalOptions: state.nearbyHospitalOptions,
        selectedHospitalId: state.selectedHospitalId,
      }),
      merge: (persistedState, currentState) => {
        const p = persistedState as
          | Partial<
              Pick<
                AssistantChatStore,
                | "messages"
                | "phase"
                | "location"
                | "selectedSymptoms"
                | "suggestedSpecialty"
                | "nearbyHospitalOptions"
                | "selectedHospitalId"
              >
            >
          | null
          | undefined;
        if (!p || typeof p !== "object") return currentState;
        let phase = p.phase ?? currentState.phase;
        if (phase === "validating") phase = "symptoms";
        if (phase === "locating") phase = "location";
        return {
          ...currentState,
          messages: p.messages ?? currentState.messages,
          phase,
          location: p.location ?? currentState.location,
          selectedSymptoms: p.selectedSymptoms ?? currentState.selectedSymptoms,
          suggestedSpecialty: p.suggestedSpecialty ?? currentState.suggestedSpecialty,
          nearbyHospitalOptions: p.nearbyHospitalOptions ?? currentState.nearbyHospitalOptions,
          selectedHospitalId: p.selectedHospitalId ?? currentState.selectedHospitalId,
        };
      },
    },
  ),
);

export function getSelectedHospitalFromStore(
  options: HospitalOption[],
  selectedId: string | null,
): HospitalOption | null {
  if (!selectedId) return options[0] ?? null;
  return options.find((h) => h.id === selectedId) ?? options[0] ?? null;
}
