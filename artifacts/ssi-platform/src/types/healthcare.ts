export type RecordType =
  | "prescription"
  | "lab_report"
  | "consultation"
  | "radiology"
  | "vaccination"
  | "discharge_summary";

export type VitalStatus = "normal" | "monitor" | "critical";

export interface AbhaProfile {
  abhaId: string;
  name: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  height: number;
  weight: number;
  bmi: number;
  vitalsStatus: VitalStatus;
  lastCheckup: string;
  hospital: string;
}

export interface VitalReading {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  spo2: number;
  temperature: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  refillDate: string;
  prescribedBy: string;
  condition: string;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  hospital: string;
  date: string;
  time: string;
  type: "followup" | "test" | "procedure" | "consultation";
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  type: RecordType;
  doctor: string;
  hospital: string;
  date: string;
  vcAnchored: boolean;
  blockchainTxHash?: string;
  blockNumber?: number;
  summary?: string;
  details?: string;
  tags?: string[];
  aiExplanation?: string;
}

export type RecordFilter =
  | "all"
  | "prescription"
  | "lab_report"
  | "consultation"
  | "radiology";
