import { Router, type IRouter } from "express";
import { db, trustedIssuersTable, verifiableCredentialsTable, blockchainLedgerTable, didDocumentsTable, usersTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function fakeTxHash() { return "0x" + randomBytes(32).toString("hex"); }
function fakeBlockNumber() { return Math.floor(45_000_000 + Math.random() * 999_999); }

// Seed demo trusted issuers if none exist
async function seedTrustedIssuers() {
  const existing = await db.select({ c: count() }).from(trustedIssuersTable);
  if (Number(existing[0].c) > 0) return;
  await db.insert(trustedIssuersTable).values([
    { orgName: "UIDAI India", orgType: "government", did: "did:ssi:govt-india-uidai", walletAddress: "0xUIDAI001", reputationScore: 100, isApproved: true, approvedAt: new Date(), polygonTxHash: fakeTxHash() },
    { orgName: "State Bank of India", orgType: "bank", did: "did:ssi:sbi-bank-001", walletAddress: "0xSBI001", reputationScore: 98, isApproved: true, approvedAt: new Date(), polygonTxHash: fakeTxHash() },
    { orgName: "IIT Delhi", orgType: "university", did: "did:ssi:iitd-edu-001", walletAddress: "0xIITD001", reputationScore: 95, isApproved: true, approvedAt: new Date(), polygonTxHash: fakeTxHash() },
    { orgName: "AIIMS New Delhi", orgType: "hospital", did: "did:ssi:aiims-hosp-001", walletAddress: "0xAIIMS001", reputationScore: 92, isApproved: true, approvedAt: new Date(), polygonTxHash: fakeTxHash() },
    { orgName: "Axis Bank Ltd.", orgType: "bank", did: "did:ssi:axis-bank-002", walletAddress: "0xAXIS001", reputationScore: 88, isApproved: false, polygonTxHash: null },
    { orgName: "University of Mumbai", orgType: "university", did: "did:ssi:mu-edu-002", walletAddress: "0xMU001", reputationScore: 85, isApproved: false, polygonTxHash: null },
  ]);
}

// GET /api/issuer/trusted — list all trusted issuers (public)
router.get("/trusted", async (req, res) => {
  try {
    await seedTrustedIssuers();
    const issuers = await db.select().from(trustedIssuersTable).orderBy(desc(trustedIssuersTable.reputationScore));
    res.json(issuers);
  } catch (err) {
    req.log.error({ err }, "Failed to list trusted issuers");
    res.status(500).json({ error: "Failed to list trusted issuers" });
  }
});

// GET /api/issuer/stats — stats for issuer dashboard
router.get("/stats", async (req, res) => {
  try {
    await seedTrustedIssuers();
    const [totalCreds] = await db.select({ c: count() }).from(verifiableCredentialsTable);
    const [activeCreds] = await db.select({ c: count() }).from(verifiableCredentialsTable).where(eq(verifiableCredentialsTable.status, "active"));
    const [revokedCreds] = await db.select({ c: count() }).from(verifiableCredentialsTable).where(eq(verifiableCredentialsTable.status, "revoked"));
    const [approvedIssuers] = await db.select({ c: count() }).from(trustedIssuersTable).where(eq(trustedIssuersTable.isApproved, true));
    const [pendingIssuers] = await db.select({ c: count() }).from(trustedIssuersTable).where(eq(trustedIssuersTable.isApproved, false));
    const [totalUsers] = await db.select({ c: count() }).from(usersTable);

    res.json({
      totalCredentials: Number(totalCreds.c),
      activeCredentials: Number(activeCreds.c),
      revokedCredentials: Number(revokedCreds.c),
      approvedIssuers: Number(approvedIssuers.c),
      pendingIssuers: Number(pendingIssuers.c),
      totalHolders: Number(totalUsers.c),
      thisMonth: Math.floor(Math.random() * 30) + 10,
      verificationsToday: Math.floor(Math.random() * 50) + 5,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get issuer stats");
    res.status(500).json({ error: "Failed to get issuer stats" });
  }
});

// GET /api/issuer/credentials — recently issued credentials
router.get("/credentials", async (req, res) => {
  try {
    const creds = await db
      .select()
      .from(verifiableCredentialsTable)
      .orderBy(desc(verifiableCredentialsTable.createdAt))
      .limit(50);

    const withLedger = await Promise.all(
      creds.map(async (vc) => {
        const [ledger] = await db.select().from(blockchainLedgerTable).where(eq(blockchainLedgerTable.credentialId, vc.credentialId)).limit(1);
        return {
          ...vc,
          credentialSubject: JSON.parse(vc.credentialSubject),
          proof: JSON.parse(vc.proof),
          blockchain: ledger ?? null,
        };
      }),
    );
    res.json(withLedger);
  } catch (err) {
    req.log.error({ err }, "Failed to list issued credentials");
    res.status(500).json({ error: "Failed to list issued credentials" });
  }
});

// POST /api/issuer/register — register a new issuer org
router.post("/register", async (req, res) => {
  try {
    const { orgName, orgType, did, walletAddress } = req.body;
    if (!orgName || !orgType || !did) return res.status(400).json({ error: "orgName, orgType, did are required" });

    const existing = await db.select().from(trustedIssuersTable).where(eq(trustedIssuersTable.did, did)).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "Issuer DID already registered" });

    const [issuer] = await db.insert(trustedIssuersTable).values({
      orgName, orgType, did, walletAddress: walletAddress || `0x${randomBytes(20).toString("hex")}`,
      reputationScore: 80, isApproved: false,
    }).returning();

    res.json({ success: true, issuer });
  } catch (err) {
    req.log.error({ err }, "Failed to register issuer");
    res.status(500).json({ error: "Failed to register issuer" });
  }
});

// POST /api/admin/issuers/:id/approve — admin approve issuer
router.post("/admin/:id/approve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const txHash = fakeTxHash();
    const [updated] = await db.update(trustedIssuersTable)
      .set({ isApproved: true, approvedAt: new Date(), polygonTxHash: txHash })
      .where(eq(trustedIssuersTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Issuer not found" });
    res.json({ success: true, issuer: updated, txHash });
  } catch (err) {
    req.log.error({ err }, "Failed to approve issuer");
    res.status(500).json({ error: "Failed to approve issuer" });
  }
});

// POST /api/admin/issuers/:id/reject — admin reject issuer
router.post("/admin/:id/reject", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(trustedIssuersTable).where(eq(trustedIssuersTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "Issuer not found" });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to reject issuer");
    res.status(500).json({ error: "Failed to reject issuer" });
  }
});

export default router;
