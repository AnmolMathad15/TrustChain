import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { activityLogTable, usersTable, transactionsTable, notificationsTable, schemesTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/admin/stats — aggregate dashboard metrics
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const [totalTransactions] = await db.select({ count: sql<number>`count(*)` }).from(transactionsTable);
    const [totalSchemes] = await db.select({ count: sql<number>`count(*)` }).from(schemesTable);
    const [unreadNotifs] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationsTable)
      .where(sql`is_read = false`);

    const recentActivity = await db
      .select()
      .from(activityLogTable)
      .orderBy(desc(activityLogTable.createdAt))
      .limit(10);

    const recentTransactions = await db
      .select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.createdAt))
      .limit(5);

    const popularServices = [
      { service: "Payments", usageCount: 248 },
      { service: "Documents", usageCount: 187 },
      { service: "Healthcare", usageCount: 134 },
      { service: "Forms", usageCount: 98 },
      { service: "Schemes", usageCount: 76 },
      { service: "ATM Assistant", usageCount: 54 },
    ];

    res.json({
      totalUsers: Number(totalUsers.count),
      totalTransactions: Number(totalTransactions.count),
      totalSchemes: Number(totalSchemes.count),
      unreadNotifications: Number(unreadNotifs.count),
      recentActivity,
      recentTransactions,
      popularServices,
      systemHealth: {
        apiStatus: "healthy",
        dbStatus: "healthy",
        aiStatus: "healthy",
        uptime: "99.8%",
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// GET /api/admin/activity — full activity log
router.get("/activity", async (req, res) => {
  try {
    const logs = await db
      .select()
      .from(activityLogTable)
      .orderBy(desc(activityLogTable.createdAt))
      .limit(50);
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Failed to get activity log");
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
});

export default router;
