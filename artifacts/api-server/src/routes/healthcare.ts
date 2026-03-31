import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { healthProfilesTable, healthRecordsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// GET /health/profile
router.get("/profile", async (req, res) => {
  try {
    const [profile] = await db.select().from(healthProfilesTable).where(eq(healthProfilesTable.userId, DEFAULT_USER_ID));
    if (!profile) {
      const [newProfile] = await db.insert(healthProfilesTable).values({
        userId: DEFAULT_USER_ID,
        bloodGroup: "O+",
        height: 175,
        weight: 70,
        allergies: [],
        conditions: [],
      }).returning();
      return res.json(newProfile);
    }
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get health profile");
    res.status(500).json({ error: "Failed to get health profile" });
  }
});

// GET /health/records
router.get("/records", async (req, res) => {
  try {
    const records = await db.select().from(healthRecordsTable)
      .where(eq(healthRecordsTable.userId, DEFAULT_USER_ID))
      .orderBy(desc(healthRecordsTable.date));
    res.json(records);
  } catch (err) {
    req.log.error({ err }, "Failed to list health records");
    res.status(500).json({ error: "Failed to list health records" });
  }
});

export default router;
