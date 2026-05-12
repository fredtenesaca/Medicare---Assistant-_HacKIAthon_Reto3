import type { HospitalOption, MockCitizen } from "@/types/patient-assistant";

export const mockCitizen: MockCitizen = {
  idNumber: "0912345678",
  name: "Daniela Morán",
  age: 34,
  city: "Guayaquil",
  insurance: "Seguro privado PlusCare",
};

export const symptomSuggestions = ["fiebre", "tos", "dolor de cabeza", "dolor abdominal", "mareos"];

export const nearbyHospitals: HospitalOption[] = [
  {
    id: "h-001",
    name: "Hospital Metropolitano Norte",
    specialty: "Medicina General y Emergencias",
    distanceKm: 1.8,
    estimatedCost: 42,
    estimatedTime: "12 min",
    rating: 4.8,
    aiRecommendation:
      "Mejor equilibrio entre cercanía, disponibilidad y costo estimado para síntomas moderados.",
    address: "Av. Francisco de Orellana 210",
  },
  {
    id: "h-002",
    name: "Clínica Santa Elena",
    specialty: "Medicina Interna",
    distanceKm: 3.4,
    estimatedCost: 28,
    estimatedTime: "18 min",
    rating: 4.6,
    aiRecommendation:
      "Opción más económica con buena capacidad para evaluación inicial y laboratorio básico.",
    address: "Kennedy Norte, Calle 8",
  },
  {
    id: "h-003",
    name: "Centro Médico VidaPlus",
    specialty: "Urgencias Ambulatorias",
    distanceKm: 2.5,
    estimatedCost: 36,
    estimatedTime: "15 min",
    rating: 4.7,
    aiRecommendation:
      "Recomendado si priorizas atención rápida y seguimiento digital posterior.",
    address: "Urdesa Central, Circunvalación Sur",
  },
];

export function getClosestHospital(options = nearbyHospitals) {
  return options.reduce((closest, option) => (option.distanceKm < closest.distanceKm ? option : closest));
}

export function getCheapestHospital(options = nearbyHospitals) {
  return options.reduce((cheapest, option) =>
    option.estimatedCost < cheapest.estimatedCost ? option : cheapest,
  );
}
