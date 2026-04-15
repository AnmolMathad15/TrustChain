import { createHash, randomBytes } from "crypto";
import { db, didDocumentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ISSUER_DID = "did:ssi:govt-india-uidai";

function generateDid(seed: string): string {
  const hash = createHash("sha256").update(seed).digest("hex");
  return `did:ssi:${hash.slice(0, 32)}`;
}

function generatePublicKey(): string {
  return randomBytes(33).toString("hex");
}

function simulatedIpfsCid(data: string): string {
  const hash = createHash("sha256").update(data).digest("hex");
  return `bafybei${hash.slice(0, 46)}`;
}

function simulatedTxHash(): string {
  return "0x" + randomBytes(32).toString("hex");
}

function simulatedBlockNumber(): number {
  return 45_000_000 + Math.floor(Math.random() * 1_000_000);
}

export async function getOrCreateDid(userId: number, userName: string, phone: string) {
  const existing = await db
    .select()
    .from(didDocumentsTable)
    .where(eq(didDocumentsTable.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const seed = `${userId}-${userName}-${phone}-ssi-platform`;
  const did = generateDid(seed);
  const publicKey = generatePublicKey();

  const didDocument = {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: "EcdsaSecp256k1VerificationKey2019",
        controller: did,
        publicKeyHex: publicKey,
      },
    ],
    authentication: [`${did}#key-1`],
    assertionMethod: [`${did}#key-1`],
    service: [
      {
        id: `${did}#ssi-service`,
        type: "SSIPlatformService",
        serviceEndpoint: "https://ssi-platform.replit.app/api",
      },
    ],
  };

  const [created] = await db
    .insert(didDocumentsTable)
    .values({
      userId,
      did,
      publicKey,
      document: JSON.stringify(didDocument),
    })
    .returning();

  return created;
}

export { ISSUER_DID, simulatedIpfsCid, simulatedTxHash, simulatedBlockNumber, generatePublicKey };
