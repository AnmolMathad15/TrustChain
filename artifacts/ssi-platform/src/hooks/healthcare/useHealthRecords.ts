import { useQuery } from "@tanstack/react-query";
import type { MedicalRecord } from "../../types/healthcare";
import { mockMedicalRecords } from "../../lib/healthcareMockData";

async function fetchHealthRecords(): Promise<MedicalRecord[]> {
  try {
    const res = await fetch("/api/health/records");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return mockMedicalRecords;
    return data;
  } catch {
    return mockMedicalRecords;
  }
}

export function useHealthRecords() {
  return useQuery<MedicalRecord[]>({
    queryKey: ["health-records"],
    queryFn: fetchHealthRecords,
    staleTime: 5 * 60 * 1000,
  });
}
