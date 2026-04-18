import type {
  AbhaProfile,
  VitalReading,
  Medication,
  Appointment,
  MedicalRecord,
} from "../types/healthcare";

export const mockAbhaProfile: AbhaProfile = {
  abhaId: "12-3456-7890-1234",
  name: "Rahul Kumar",
  dob: "1988-05-12",
  gender: "Male",
  bloodGroup: "B+",
  height: 172,
  weight: 68,
  bmi: 23.0,
  vitalsStatus: "normal",
  lastCheckup: "2024-01-15",
  hospital: "Apollo Hospital Bangalore",
};

export const mockVitalReadings: VitalReading[] = [
  { date: "2024-01-10", systolic: 122, diastolic: 80, heartRate: 72, spo2: 98, temperature: 98.4 },
  { date: "2024-01-12", systolic: 125, diastolic: 82, heartRate: 74, spo2: 98, temperature: 98.6 },
  { date: "2024-01-14", systolic: 128, diastolic: 83, heartRate: 71, spo2: 99, temperature: 98.5 },
  { date: "2024-01-16", systolic: 130, diastolic: 85, heartRate: 73, spo2: 98, temperature: 98.7 },
  { date: "2024-01-18", systolic: 128, diastolic: 84, heartRate: 70, spo2: 99, temperature: 98.4 },
  { date: "2024-01-20", systolic: 127, diastolic: 83, heartRate: 72, spo2: 98, temperature: 98.5 },
];

export const mockMedications: Medication[] = [
  {
    id: "med-1",
    name: "Amlodipine",
    dosage: "5mg",
    frequency: "Once daily",
    startDate: "2024-01-15",
    refillDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    prescribedBy: "Dr. Priya Sharma",
    condition: "Hypertension",
  },
  {
    id: "med-2",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    startDate: "2023-11-10",
    refillDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    prescribedBy: "Dr. Arjun Mehta",
    condition: "Type 2 Diabetes",
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: "appt-1",
    title: "Cardiology Follow-up",
    doctor: "Dr. Priya Sharma",
    hospital: "Apollo Hospital Bangalore",
    date: "2026-04-22",
    time: "10:30 AM",
    type: "followup",
    notes: "Bring previous ECG report",
  },
  {
    id: "appt-2",
    title: "Blood Sugar Test HbA1c",
    doctor: "Lab Technician",
    hospital: "Apollo Diagnostics",
    date: "2026-05-05",
    time: "07:00 AM",
    type: "test",
    notes: "Fasting required — no food or water 8 hours before",
  },
];

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "rec-1",
    title: "Hypertension Medication",
    type: "prescription",
    doctor: "Dr. Priya Sharma",
    hospital: "Apollo Hospital Bangalore",
    date: "2024-01-16",
    vcAnchored: true,
    blockchainTxHash: "0x7f3a9c2d4e5b1a8f6c3d9e2b4a7f1c5d8e3b6a9c2d4e7f1a3b5c8d9e2f4a7b",
    blockNumber: 45156205,
    summary: "Amlodipine 5mg prescribed for blood pressure management.",
    details:
      "Amlodipine 5mg once daily for 90 days. Patient diagnosed with stage 1 hypertension. BP recorded at 138/88 mmHg. Follow-up in 30 days. Lifestyle changes advised: reduce salt intake, regular exercise.",
    tags: ["hypertension", "amlodipine", "bp"],
  },
  {
    id: "rec-2",
    title: "Annual Health Checkup",
    type: "consultation",
    doctor: "Dr. Priya Sharma",
    hospital: "Apollo Hospital Bangalore",
    date: "2024-01-15",
    vcAnchored: true,
    blockchainTxHash: "0x3b5c8d9e2f4a7b1c6d3e8f2a5b9c4d7e1f3a6b8c2d5e9f1a4b7c3d6e8f2a5b",
    blockNumber: 45402428,
    summary: "Comprehensive annual health examination. All parameters within normal range.",
    details:
      "Full body checkup completed. CBC, lipid profile, thyroid, liver function tests — all normal. BMI 23.0 — healthy range. Dental and ophthalmology referral suggested. Patient advised to continue current medication.",
    tags: ["annual", "checkup", "preventive"],
  },
  {
    id: "rec-3",
    title: "Complete Blood Count (CBC)",
    type: "lab_report",
    doctor: "Dr. Priya Sharma",
    hospital: "Apollo Diagnostics",
    date: "2024-01-15",
    vcAnchored: true,
    blockchainTxHash: "0x9e2f4a7b1c6d3e8f2a5b9c4d7e1f3a6b8c2d5e9f1a4b7c3d6e8f2a5b1c6d3e",
    blockNumber: 45537649,
    summary: "CBC results — all values within normal limits. Hemoglobin 14.2 g/dL.",
    details:
      "Hemoglobin: 14.2 g/dL (Normal: 13.5–17.5)\nWBC: 7,200/μL (Normal: 4,500–11,000)\nPlatelets: 2,50,000/μL (Normal: 1,50,000–4,00,000)\nHematocrit: 43.5%\nMCV: 89 fL — all values within normal range.",
    tags: ["blood", "cbc", "hematology"],
  },
  {
    id: "rec-4",
    title: "Chest X-Ray PA View",
    type: "radiology",
    doctor: "Dr. Kavita Rao",
    hospital: "Apollo Hospital Bangalore",
    date: "2024-01-15",
    vcAnchored: true,
    blockchainTxHash: "0x1c6d3e8f2a5b9c4d7e1f3a6b8c2d5e9f1a4b7c3d6e8f2a5b1c6d3e8f2a5b9c",
    blockNumber: 45320898,
    summary: "Chest X-ray normal. No consolidation or pleural effusion noted.",
    details:
      "PA view chest X-ray: Cardiac size within normal limits. Lung fields clear bilaterally. No pleural effusion. Costophrenic angles sharp. Mediastinum not widened. No bony abnormalities detected. Impression: Normal chest radiograph.",
    tags: ["xray", "chest", "radiology", "normal"],
  },
];
