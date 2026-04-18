import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "../../types/healthcare";
import { mockAppointments } from "../../lib/healthcareMockData";

async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const res = await fetch("/api/health/appointments");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return mockAppointments;
    const now = new Date();
    return data
      .filter((a: Appointment) => new Date(a.date) >= now)
      .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return mockAppointments;
  }
}

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ["health-appointments"],
    queryFn: fetchAppointments,
    staleTime: 5 * 60 * 1000,
  });
}
