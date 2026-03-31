import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { schemesTable, complaintsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// GET /schemes
router.get("/", async (req, res) => {
  try {
    const schemes = await db.select().from(schemesTable).where(eq(schemesTable.isActive, true));
    res.json(schemes);
  } catch (err) {
    req.log.error({ err }, "Failed to list schemes");
    res.status(500).json({ error: "Failed to list schemes" });
  }
});

// GET /schemes/:id/eligibility
router.get("/:id/eligibility", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [scheme] = await db.select().from(schemesTable).where(eq(schemesTable.id, id));
    if (!scheme) return res.status(404).json({ error: "Scheme not found" });
    
    // Mock eligibility logic
    const eligible = Math.random() > 0.3;
    res.json({
      eligible,
      reason: eligible
        ? "Based on your profile, you appear to meet the eligibility criteria for this scheme."
        : "Based on your profile, you may not currently meet all eligibility requirements.",
      requirements: [
        "Indian citizen with valid Aadhaar",
        "Age between 18-60 years",
        "Annual income below applicable threshold",
        "Not already enrolled in a conflicting scheme",
      ],
      nextSteps: eligible
        ? "Visit your nearest CSC (Common Service Centre) or apply online with your Aadhaar and income certificate."
        : "You can reapply when your circumstances change or contact your local government office for assistance.",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to check eligibility");
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});

// POST /schemes/complaints
router.post("/complaints", async (req, res) => {
  try {
    const { category, subject, description, schemeId } = req.body;
    const referenceNumber = `CMP${Date.now().toString().slice(-8)}`;
    const [complaint] = await db.insert(complaintsTable).values({
      userId: DEFAULT_USER_ID,
      category,
      subject,
      description,
      schemeId: schemeId || 0,
      referenceNumber,
    }).returning();
    res.status(201).json({
      id: complaint.id,
      referenceNumber,
      message: "Your complaint has been registered successfully. You will receive updates on your registered contact.",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit complaint");
    res.status(500).json({ error: "Failed to submit complaint" });
  }
});

export default router;
