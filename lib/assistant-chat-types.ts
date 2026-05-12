import type { MedicalAgentResponse } from "@/types/medical-agent";

export type AssistantPhase = "id" | "validating" | "symptoms" | "location" | "location-fallback" | "locating" | "results";

export type AssistantMessageKind =
  | "text"
  | "patient"
  | "location-action"
  | "location"
  | "hospitals"
  | "agent-results"
  | "final-actions"
  | "new-consultation-prompt";

export type AssistantChatMessageItem = {
  id: string;
  role: "bot" | "user";
  kind: AssistantMessageKind;
  content?: string | MedicalAgentResponse;
};

export type AssistantLocationState = {
  lat: number;
  lon: number;
  label: string;
  city?: string;
  province?: string;
};
