import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable, billsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// GET /payments
router.get("/", async (req, res) => {
  try {
    const txns = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.userId, DEFAULT_USER_ID))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(20);
    res.json(txns);
  } catch (err) {
    req.log.error({ err }, "Failed to list transactions");
    res.status(500).json({ error: "Failed to list transactions" });
  }
});

// GET /payments/bills
router.get("/bills", async (req, res) => {
  try {
    const bills = await db.select().from(billsTable)
      .where(eq(billsTable.userId, DEFAULT_USER_ID))
      .orderBy(billsTable.dueDate);
    res.json(bills);
  } catch (err) {
    req.log.error({ err }, "Failed to list bills");
    res.status(500).json({ error: "Failed to list bills" });
  }
});

// POST /payments/pay  — payment session creation + processing
router.post("/pay", async (req, res) => {
  try {
    const { billId, amount, upiId, description } = req.body;

    req.log.info({ billId, amount, upiId, description }, "[Payment] Session received");

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      req.log.warn({ amount }, "[Payment] Invalid amount");
      return res.status(400).json({ error: "Invalid payment amount." });
    }
    if (!upiId || typeof upiId !== "string" || !upiId.trim()) {
      return res.status(400).json({ error: "UPI ID is required." });
    }

    // Mark bill as paid if billId provided
    if (billId) {
      await db.update(billsTable).set({ isPaid: true }).where(eq(billsTable.id, Number(billId)));
      req.log.info({ billId }, "[Payment] Bill marked paid");
    }

    const transactionId = `TXN${Date.now().toString().slice(-10)}`;

    await db.insert(transactionsTable).values({
      userId: DEFAULT_USER_ID,
      type: "payment",
      amount: String(amount),
      recipient: upiId.trim(),
      status: "success",
      description: description || "Bill payment",
    });

    req.log.info({ transactionId, amount }, "[Payment] Transaction created successfully");

    res.json({
      success: true,
      transactionId,
      amount: Number(amount),
      message: "Payment successful! Your transaction has been processed.",
    });
  } catch (err) {
    req.log.error({ err }, "[Payment] Failed to process payment session");
    res.status(500).json({ error: "Payment failed. Please try again." });
  }
});

export default router;
