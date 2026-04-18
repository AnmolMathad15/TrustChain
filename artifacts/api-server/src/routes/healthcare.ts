import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { healthProfilesTable, healthRecordsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// ── Mock data (dev fallback) ─────────────────────────────────────────────────

const MOCK_APPOINTMENTS = [
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

const now = Date.now();
const MOCK_MEDICATIONS = [
  {
    id: "med-1",
    name: "Amlodipine",
    dosage: "5mg",
    frequency: "Once daily",
    startDate: "2024-01-15",
    refillDate: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
    prescribedBy: "Dr. Priya Sharma",
    condition: "Hypertension",
  },
  {
    id: "med-2",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    startDate: "2023-11-10",
    refillDate: new Date(now + 18 * 24 * 60 * 60 * 1000).toISOString(),
    prescribedBy: "Dr. Arjun Mehta",
    condition: "Type 2 Diabetes",
  },
];

const MOCK_VITALS = [
  { date: "2024-01-10", systolic: 122, diastolic: 80, heartRate: 72, spo2: 98, temperature: 98.4 },
  { date: "2024-01-12", systolic: 125, diastolic: 82, heartRate: 74, spo2: 98, temperature: 98.6 },
  { date: "2024-01-14", systolic: 128, diastolic: 83, heartRate: 71, spo2: 99, temperature: 98.5 },
  { date: "2024-01-16", systolic: 130, diastolic: 85, heartRate: 73, spo2: 98, temperature: 98.7 },
  { date: "2024-01-18", systolic: 128, diastolic: 84, heartRate: 70, spo2: 99, temperature: 98.4 },
  { date: "2024-01-20", systolic: 127, diastolic: 83, heartRate: 72, spo2: 98, temperature: 98.5 },
];

// ── GET /health/profile ──────────────────────────────────────────────────────
router.get("/profile", async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(healthProfilesTable)
      .where(eq(healthProfilesTable.userId, DEFAULT_USER_ID));

    if (!profile) {
      const [newProfile] = await db
        .insert(healthProfilesTable)
        .values({
          userId: DEFAULT_USER_ID,
          bloodGroup: "B+",
          height: 172,
          weight: 68,
          allergies: [],
          conditions: [],
        })
        .returning();
      return res.json({
        ...newProfile,
        abhaId: "12-3456-7890-1234",
        name: "Rahul Kumar",
        dob: "1988-05-12",
        gender: "Male",
        bmi: 23.0,
        vitalsStatus: "normal",
        lastCheckup: "2024-01-15",
        hospital: "Apollo Hospital Bangalore",
      });
    }

    res.json({
      ...profile,
      abhaId: "12-3456-7890-1234",
      name: "Rahul Kumar",
      dob: "1988-05-12",
      gender: "Male",
      bmi: profile.weight && profile.height
        ? +(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
        : 23.0,
      vitalsStatus: "normal",
      lastCheckup: profile.lastCheckup ?? "2024-01-15",
      hospital: "Apollo Hospital Bangalore",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get health profile");
    res.status(500).json({ error: "Failed to get health profile" });
  }
});

// ── GET /health/records ──────────────────────────────────────────────────────
router.get("/records", async (req, res) => {
  try {
    const records = await db
      .select()
      .from(healthRecordsTable)
      .where(eq(healthRecordsTable.userId, DEFAULT_USER_ID))
      .orderBy(desc(healthRecordsTable.date));
    res.json(records);
  } catch (err) {
    req.log.error({ err }, "Failed to list health records");
    res.status(500).json({ error: "Failed to list health records" });
  }
});

// ── GET /health/records/:id ──────────────────────────────────────────────────
router.get("/records/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [record] = await db
      .select()
      .from(healthRecordsTable)
      .where(eq(healthRecordsTable.id, id));
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json(record);
  } catch (err) {
    req.log.error({ err }, "Failed to get health record");
    res.status(500).json({ error: "Failed to get health record" });
  }
});

// ── GET /health/appointments ─────────────────────────────────────────────────
router.get("/appointments", async (_req, res) => {
  res.json(MOCK_APPOINTMENTS);
});

// ── GET /health/medications ──────────────────────────────────────────────────
router.get("/medications", async (_req, res) => {
  res.json(MOCK_MEDICATIONS);
});

// ── GET /health/vitals ───────────────────────────────────────────────────────
router.get("/vitals", async (_req, res) => {
  res.json(MOCK_VITALS);
});

// ── POST /health/sync ─────────────────────────────────────────────────────────
router.post("/sync", async (_req, res) => {
  await new Promise((r) => setTimeout(r, 800));
  res.json({ success: true, syncedAt: new Date().toISOString(), message: "ABHA sync complete" });
});

export default router;
