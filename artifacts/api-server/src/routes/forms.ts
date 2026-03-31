import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { governmentFormsTable, formSubmissionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// GET /forms
router.get("/", async (req, res) => {
  try {
    const forms = await db.select().from(governmentFormsTable);
    res.json(forms);
  } catch (err) {
    req.log.error({ err }, "Failed to list forms");
    res.status(500).json({ error: "Failed to list forms" });
  }
});

// GET /forms/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [form] = await db.select().from(governmentFormsTable).where(eq(governmentFormsTable.id, id));
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    req.log.error({ err }, "Failed to get form");
    res.status(500).json({ error: "Failed to get form" });
  }
});

// POST /forms/:id/submit
router.post("/:id/submit", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { data } = req.body;
    const referenceNumber = `REF${Date.now().toString().slice(-8)}`;
    await db.insert(formSubmissionsTable).values({
      userId: DEFAULT_USER_ID,
      formId: id,
      referenceNumber,
      data,
    });
    res.json({
      success: true,
      referenceNumber,
      message: "Your form has been submitted successfully. You will receive a confirmation shortly.",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit form");
    res.status(500).json({ error: "Failed to submit form" });
  }
});

export default router;
