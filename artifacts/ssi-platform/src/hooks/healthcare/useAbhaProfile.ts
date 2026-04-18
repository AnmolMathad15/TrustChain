import { useQuery } from "@tanstack/react-query";
import type { AbhaProfile } from "../../types/healthcare";
import { mockAbhaProfile } from "../../lib/healthcareMockData";

async function fetchAbhaProfile(): Promise<AbhaProfile> {
  try {
    const res = await fetch("/api/health/profile");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return {
      abhaId: data.abhaId ?? "12-3456-7890-1234",
      name: data.name ?? mockAbhaProfile.name,
      dob: data.dob ?? mockAbhaProfile.dob,
      gender: data.gender ?? mockAbhaProfile.gender,
      bloodGroup: data.bloodGroup ?? mockAbhaProfile.bloodGroup,
      height: data.height ?? mockAbhaProfile.height,
      weight: data.weight ?? mockAbhaProfile.weight,
      bmi: data.bmi ?? mockAbhaProfile.bmi,
      vitalsStatus: data.vitalsStatus ?? mockAbhaProfile.vitalsStatus,
      lastCheckup: data.lastCheckup ?? mockAbhaProfile.lastCheckup,
      hospital: data.hospital ?? mockAbhaProfile.hospital,
    };
  } catch {
    return mockAbhaProfile;
  }
}

export function useAbhaProfile() {
  return useQuery<AbhaProfile>({
    queryKey: ["abha-profile"],
    queryFn: fetchAbhaProfile,
    staleTime: 10 * 60 * 1000,
  });
}
