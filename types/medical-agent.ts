export type MedicalAgentUrgency = "ALTA" | "MEDIA" | "BAJA" | string;

export type MedicalAgentHospital = {
  id: string;
  name: string;
  address: string;
  distanceKm?: number;
  copago?: string;
  coverage?: string;
  phone?: string;
  specialty?: string;
};

export type MedicalAgentResponse = {
  analysis: string;
  urgency: MedicalAgentUrgency;
  specialty: string;
  hospitals: MedicalAgentHospital[];
  costBase?: string;
  coverage?: string;
  copago?: string;
  recommendation?: string;
};

export type MedicalAgentWebhookPayload = {
  paciente_cedula: string;
  paciente_sintoma: string;
  usuario_lat: number;
  usuario_long: number;
};
