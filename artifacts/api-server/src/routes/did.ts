import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getOrCreateDid } from "../services/did.js";
import { issueAllCredentialsForUser } from "../services/credentials.js";

const router: IRouter = Router();
const DEFAULT_USER_ID = 1;

// POST /api/did/create — create or retrieve DID for user
router.post("/create", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEFAULT_USER_ID)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    const didRecord = await getOrCreateDid(user.id, user.name, user.phone);
    await issueAllCredentialsForUser(user.id);

    res.json({
      did: didRecord.did,
      publicKey: didRecord.publicKey,
      document: JSON.parse(didRecord.document),
      createdAt: didRecord.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create DID");
    res.status(500).json({ error: "Failed to create DID" });
  }
});

// GET /api/did/:userId — get DID document for user
router.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || DEFAULT_USER_ID;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    const didRecord = await getOrCreateDid(user.id, user.name, user.phone);
    await issueAllCredentialsForUser(user.id);

    res.json({
      did: didRecord.did,
      publicKey: didRecord.publicKey,
      document: JSON.parse(didRecord.document),
      createdAt: didRecord.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get DID");
    res.status(500).json({ error: "Failed to get DID" });
  }
});

export default router;
