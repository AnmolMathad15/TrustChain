import { Router, type IRouter } from "express";
import { db, apiKeysTable, verificationLogsTable, verifiableCredentialsTable, blockchainLedgerTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function generateApiKey(tier: string) {
  return `tc_${tier}_${randomBytes(24).toString("hex")}`;
}

// Seed demo API keys and verification logs
async function seedVerifierData() {
  const existing = await db.select({ c: count() }).from(apiKeysTable);
  if (Number(existing[0].c) > 0) return;

  await db.insert(apiKeysTable).values([
    { key: generateApiKey("enterprise"), orgName: "Infosys BPO", verifierDid: "did:ssi:infosys-verify-001", tier: "enterprise", usageCount: 1248, monthlyLimit: 99999, isActive: true },
    { key: generateApiKey("starter"), orgName: "HDFC HR Dept.", verifierDid: "did:ssi:hdfc-verify-002", tier: "starter", usageCount: 312, monthlyLimit: 500, isActive: true },
    { key: generateApiKey("free"), orgName: "Startup Verifier", verifierDid: "did:ssi:startup-verify-003", tier: "free", usageCount: 8, monthlyLimit: 10, isActive: true },
  ]);

  await db.insert(verificationLogsTable).values([
    { credentialId: "demo-vc-001", verifierDid: "did:ssi:infosys-verify-001", verifierOrg: "Infosys BPO", result: true },
    { credentialId: "demo-vc-002", verifierDid: "did:ssi:hdfc-verify-002", verifierOrg: "HDFC HR Dept.", result: true },
    { credentialId: "demo-vc-003", verifierDid: "did:ssi:infosys-verify-001", verifierOrg: "Infosys BPO", result: false, failureReason: "Credential revoked" },
    { credentialId: "demo-vc-004", verifierDid: "did:ssi:hdfc-verify-002", verifierOrg: "HDFC HR Dept.", result: true },
    { credentialId: "demo-vc-005", verifierDid: "did:ssi:startup-verify-003", verifierOrg: "Startup Verifier", result: false, failureReason: "Credential expired" },
  ]);
}

// GET /api/verifier/stats
router.get("/stats", async (req, res) => {
  try {
    await seedVerifierData();
    const [totalKeys] = await db.select({ c: count() }).from(apiKeysTable);
    const [totalLogs] = await db.select({ c: count() }).from(verificationLogsTable);
    const [successLogs] = await db.select({ c: count() }).from(verificationLogsTable).where(eq(verificationLogsTable.result, true));
    const [activeKeys] = await db.select({ c: count() }).from(apiKeysTable).where(eq(apiKeysTable.isActive, true));

    res.json({
      totalApiKeys: Number(totalKeys.c),
      activeApiKeys: Number(activeKeys.c),
      totalVerifications: Number(totalLogs.c),
      successfulVerifications: Number(successLogs.c),
      failedVerifications: Number(totalLogs.c) - Number(successLogs.c),
      successRate: totalLogs.c > 0 ? Math.round((Number(successLogs.c) / Number(totalLogs.c)) * 100) : 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get verifier stats");
    res.status(500).json({ error: "Failed to get verifier stats" });
  }
});

// GET /api/verifier/api-keys
router.get("/api-keys", async (req, res) => {
  try {
    await seedVerifierData();
    const keys = await db.select().from(apiKeysTable).orderBy(desc(apiKeysTable.createdAt));
    res.json(keys);
  } catch (err) {
    req.log.error({ err }, "Failed to list API keys");
    res.status(500).json({ error: "Failed to list API keys" });
  }
});

// POST /api/verifier/api-keys — create new API key
router.post("/api-keys", async (req, res) => {
  try {
    const { orgName, verifierDid, tier = "starter" } = req.body;
    if (!orgName || !verifierDid) return res.status(400).json({ error: "orgName and verifierDid are required" });

    const limits: Record<string, number> = { free: 10, starter: 500, enterprise: 99999 };
    const [newKey] = await db.insert(apiKeysTable).values({
      key: generateApiKey(tier),
      orgName,
      verifierDid,
      tier,
      monthlyLimit: limits[tier] ?? 500,
      isActive: true,
    }).returning();

    res.json({ success: true, apiKey: newKey });
  } catch (err) {
    req.log.error({ err }, "Failed to create API key");
    res.status(500).json({ error: "Failed to create API key" });
  }
});

// DELETE /api/verifier/api-keys/:id — revoke API key
router.delete("/api-keys/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(apiKeysTable).set({ isActive: false }).where(eq(apiKeysTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "API key not found" });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to revoke API key");
    res.status(500).json({ error: "Failed to revoke API key" });
  }
});

// GET /api/verifier/logs — verification history
router.get("/logs", async (req, res) => {
  try {
    await seedVerifierData();
    const logs = await db.select().from(verificationLogsTable).orderBy(desc(verificationLogsTable.verifiedAt)).limit(100);
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Failed to list verification logs");
    res.status(500).json({ error: "Failed to list verification logs" });
  }
});

// POST /api/verifier/logs — log a new verification
router.post("/logs", async (req, res) => {
  try {
    const { credentialId, verifierDid, verifierOrg, result, failureReason } = req.body;
    if (!credentialId || !verifierDid || result === undefined) return res.status(400).json({ error: "credentialId, verifierDid, result are required" });
    const [log] = await db.insert(verificationLogsTable).values({ credentialId, verifierDid, verifierOrg, result, failureReason }).returning();
    res.json({ success: true, log });
  } catch (err) {
    req.log.error({ err }, "Failed to log verification");
    res.status(500).json({ error: "Failed to log verification" });
  }
});

export default router;
