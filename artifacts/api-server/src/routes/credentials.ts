import { Router, type IRouter } from "express";
import { db, verifiableCredentialsTable, blockchainLedgerTable, usersTable, didDocumentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getOrCreateDid } from "../services/did.js";
import { issueAllCredentialsForUser, verifyCredential, issueCredential } from "../services/credentials.js";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// GET /api/credentials/:userId — list all credentials for user
router.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || DEFAULT_USER_ID;
    await issueAllCredentialsForUser(userId);

    const credentials = await db
      .select()
      .from(verifiableCredentialsTable)
      .where(eq(verifiableCredentialsTable.userId, userId))
      .orderBy(desc(verifiableCredentialsTable.createdAt));

    const withLedger = await Promise.all(
      credentials.map(async (vc) => {
        const [ledger] = await db
          .select()
          .from(blockchainLedgerTable)
          .where(eq(blockchainLedgerTable.credentialId, vc.credentialId))
          .limit(1);
        return {
          ...vc,
          credentialSubject: JSON.parse(vc.credentialSubject),
          proof: JSON.parse(vc.proof),
          blockchain: ledger
            ? {
                txHash: ledger.txHash,
                blockNumber: ledger.blockNumber,
                network: ledger.network,
                anchoredAt: ledger.anchoredAt,
              }
            : null,
        };
      }),
    );

    res.json(withLedger);
  } catch (err) {
    req.log.error({ err }, "Failed to list credentials");
    res.status(500).json({ error: "Failed to list credentials" });
  }
});

// POST /api/credentials/issue — issue a credential manually
router.post("/issue", async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID;
    const { documentId, type, name, documentNumber, issuedDate, expiryDate } = req.body;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    const didRecord = await getOrCreateDid(user.id, user.name, user.phone);

    const vc = await issueCredential(userId, didRecord.did, {
      id: documentId ?? 0,
      type: type ?? "custom",
      name: name ?? "Custom Document",
      documentNumber: documentNumber ?? "N/A",
      issuedDate: issuedDate ?? new Date().toISOString().slice(0, 10),
      expiryDate: expiryDate ?? null,
    });

    const [ledger] = await db
      .select()
      .from(blockchainLedgerTable)
      .where(eq(blockchainLedgerTable.credentialId, vc.credentialId))
      .limit(1);

    res.json({
      ...vc,
      credentialSubject: JSON.parse(vc.credentialSubject),
      proof: JSON.parse(vc.proof),
      blockchain: ledger ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to issue credential");
    res.status(500).json({ error: "Failed to issue credential" });
  }
});

// POST /api/credentials/verify — verify a credential by ID
router.post("/verify", async (req, res) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId) return res.status(400).json({ error: "credentialId is required" });
    const result = await verifyCredential(credentialId);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to verify credential");
    res.status(500).json({ error: "Failed to verify credential" });
  }
});

// POST /api/credentials/:credentialId/revoke — revoke a credential
router.post("/:credentialId/revoke", async (req, res) => {
  try {
    const { credentialId } = req.params;
    const [updated] = await db
      .update(verifiableCredentialsTable)
      .set({ status: "revoked" })
      .where(eq(verifiableCredentialsTable.credentialId, credentialId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Credential not found" });
    res.json({ success: true, credentialId, status: "revoked" });
  } catch (err) {
    req.log.error({ err }, "Failed to revoke credential");
    res.status(500).json({ error: "Failed to revoke credential" });
  }
});

export default router;
