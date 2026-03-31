import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// GET /notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, DEFAULT_USER_ID))
      .orderBy(desc(notificationsTable.createdAt));
    res.json(notifications);
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Failed to list notifications" });
  }
});

// POST /notifications/:id/read
router.post("/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to mark notification as read");
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// POST /notifications/mark-all-read
router.post("/mark-all-read", async (req, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, DEFAULT_USER_ID));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to mark all notifications read");
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// POST /notifications/reset-unread — marks all notifications as unread (test/demo helper)
router.post("/reset-unread", async (req, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: false })
      .where(eq(notificationsTable.userId, DEFAULT_USER_ID));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to reset notifications to unread");
    res.status(500).json({ error: "Failed to reset notifications" });
  }
});

export default router;
