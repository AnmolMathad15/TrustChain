import { useQuery } from "@tanstack/react-query";
import type { Medication } from "../../types/healthcare";
import { mockMedications } from "../../lib/healthcareMockData";

function daysUntilRefill(refillDate: string): number {
  const now = new Date();
  const refill = new Date(refillDate);
  return Math.max(0, Math.ceil((refill.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

async function fetchMedications(): Promise<Medication[]> {
  try {
    const res = await fetch("/api/health/medications");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return mockMedications;
    return data.sort(
      (a: Medication, b: Medication) =>
        daysUntilRefill(a.refillDate) - daysUntilRefill(b.refillDate)
    );
  } catch {
    return mockMedications.sort(
      (a, b) => daysUntilRefill(a.refillDate) - daysUntilRefill(b.refillDate)
    );
  }
}

export function useMedications() {
  return useQuery<Medication[]>({
    queryKey: ["health-medications"],
    queryFn: fetchMedications,
    staleTime: 5 * 60 * 1000,
  });
}

export { daysUntilRefill };
