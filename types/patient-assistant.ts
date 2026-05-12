export type MockCitizen = {
  idNumber: string;
  name: string;
  age: number;
  city: string;
  insurance: string;
};

export type HospitalOption = {
  id: string;
  name: string;
  specialty: string;
  distanceKm: number;
  estimatedCost: number;
  estimatedTime: string;
  rating: number;
  aiRecommendation: string;
  address: string;
  /** Estimación orientativa de cobertura/copago (no garantía). */
  coverageEstimate?: string;
  lat?: number;
  lon?: number;
  source?: "osm" | "demo";
};

export type AssistantTicket = {
  patient: MockCitizen;
  symptoms: string[];
  selectedHospital: HospitalOption;
  createdAt: string;
};
