import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, activityLogTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_USER_ID = 1;

// GET /users/profile
router.get("/profile", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));
    if (!user) {
      // Auto-create default user
      const ssiId = `SSI${Date.now().toString().slice(-8)}`;
      const [newUser] = await db.insert(usersTable).values({
        ssiId,
        name: "Rahul Kumar",
        phone: "+91 9876543210",
        preferredLanguage: "en",
        isKioskMode: false,
      }).returning();
      return res.json(newUser);
    }
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to get user profile");
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// PUT /users/profile
router.put("/profile", async (req, res) => {
  try {
    const { name, preferredLanguage, isKioskMode } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ name, preferredLanguage, isKioskMode })
      .where(eq(usersTable.id, DEFAULT_USER_ID))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update user profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /users/activity
router.get("/activity", async (req, res) => {
  try {
    const logs = await db.select().from(activityLogTable)
      .where(eq(activityLogTable.userId, DEFAULT_USER_ID))
      .orderBy(desc(activityLogTable.createdAt))
      .limit(20);
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Failed to get activity log");
    res.status(500).json({ error: "Failed to get activity log" });
  }
});

export default router;
