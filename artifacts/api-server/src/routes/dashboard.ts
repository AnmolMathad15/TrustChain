import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { billsTable, notificationsTable, documentsTable, transactionsTable, schemesTable, governmentFormsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// GET /dashboard/summary
router.get("/summary", async (req, res) => {
  try {
    const [pendingBillsResult] = await db.select().from(billsTable)
      .where(and(eq(billsTable.userId, DEFAULT_USER_ID), eq(billsTable.isPaid, false)));
    
    const [unreadNotifResult] = await db.select().from(notificationsTable)
      .where(and(eq(notificationsTable.userId, DEFAULT_USER_ID), eq(notificationsTable.isRead, false)));

    const allBills = await db.select().from(billsTable).where(and(eq(billsTable.userId, DEFAULT_USER_ID), eq(billsTable.isPaid, false)));
    const allUnread = await db.select().from(notificationsTable).where(and(eq(notificationsTable.userId, DEFAULT_USER_ID), eq(notificationsTable.isRead, false)));
    const allDocs = await db.select().from(documentsTable).where(eq(documentsTable.userId, DEFAULT_USER_ID));
    const allTxns = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, DEFAULT_USER_ID));
    const allSchemes = await db.select().from(schemesTable).where(eq(schemesTable.isActive, true));
    const allForms = await db.select().from(governmentFormsTable);
    
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID));

    res.json({
      pendingBills: allBills.length,
      unreadNotifications: allUnread.length,
      documentsCount: allDocs.length,
      recentTransactions: allTxns.length,
      availableSchemes: allSchemes.length,
      pendingForms: allForms.length,
      lastLogin: user?.createdAt || new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

export default router;
