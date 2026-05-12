import type { HospitalOption } from "@/types/patient-assistant";

import { HospitalCard } from "@/components/results/hospital-card";

export function HospitalRecommendationCard({
  hospital,
  featured = false,
}: {
  hospital: HospitalOption;
  featured?: boolean;
}) {
  return <HospitalCard featured={featured} hospital={hospital} />;
}
