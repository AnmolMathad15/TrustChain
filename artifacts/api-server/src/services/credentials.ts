import { createHash } from "crypto";
import { db, verifiableCredentialsTable, blockchainLedgerTable, didDocumentsTable, documentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ISSUER_DID, simulatedIpfsCid, simulatedTxHash, simulatedBlockNumber } from "./did.js";

const DOC_TYPE_MAP: Record<string, string> = {
  aadhaar: "AadhaarCredential",
  pan: "PanCardCredential",
  "driving-license": "DrivingLicenseCredential",
  passport: "PassportCredential",
  "voter-id": "VoterIdCredential",
  ration: "RationCardCredential",
  certificate: "AcademicCredential",
  health: "HealthRecordCredential",
};

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

function newCredentialId(): string {
  return `vc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function issueCredential(
  userId: number,
  userDid: string,
  doc: { id: number; type: string; name: string; documentNumber: string; issuedDate?: string | null; expiryDate?: string | null },
) {
  const existing = await db
    .select()
    .from(verifiableCredentialsTable)
    .where(eq(verifiableCredentialsTable.documentId, doc.id))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const credentialId = newCredentialId();
  const issuanceDate = new Date().toISOString();
  const vcType = DOC_TYPE_MAP[doc.type.toLowerCase()] ?? "VerifiableCredential";

  const credentialSubject = {
    id: userDid,
    documentType: doc.type,
    documentName: doc.name,
    documentNumber: doc.documentNumber,
    issuedDate: doc.issuedDate ?? "N/A",
    expiryDate: doc.expiryDate ?? "N/A",
  };

  const vcPayload = {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://ssi-platform.in/credentials/v1"],
    id: `https://ssi-platform.in/credentials/${credentialId}`,
    type: ["VerifiableCredential", vcType],
    issuer: ISSUER_DID,
    issuanceDate,
    credentialSubject,
  };

  const hash = sha256(JSON.stringify(vcPayload));

  const proof = {
    type: "EcdsaSecp256k1Signature2019",
    created: issuanceDate,
    verificationMethod: `${ISSUER_DID}#key-1`,
    proofPurpose: "assertionMethod",
    hash: `sha256:${hash}`,
  };

  const ipfsCid = simulatedIpfsCid(JSON.stringify(vcPayload));

  const [vc] = await db
    .insert(verifiableCredentialsTable)
    .values({
      credentialId,
      userId,
      documentId: doc.id,
      type: vcType,
      issuer: ISSUER_DID,
      issuanceDate,
      credentialSubject: JSON.stringify(credentialSubject),
      proof: JSON.stringify(proof),
      hash,
      ipfsCid,
      status: "active",
    })
    .returning();

  await db.insert(blockchainLedgerTable).values({
    credentialId,
    hash,
    txHash: simulatedTxHash(),
    blockNumber: simulatedBlockNumber(),
    network: "polygon-mumbai",
  });

  return vc;
}

export async function issueAllCredentialsForUser(userId: number) {
  const didRecord = await db
    .select()
    .from(didDocumentsTable)
    .where(eq(didDocumentsTable.userId, userId))
    .limit(1);

  if (!didRecord.length) return [];

  const userDid = didRecord[0].did;
  const documents = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.userId, userId));

  const results = [];
  for (const doc of documents) {
    const vc = await issueCredential(userId, userDid, doc);
    results.push(vc);
  }
  return results;
}

export async function verifyCredential(credentialId: string) {
  const [vc] = await db
    .select()
    .from(verifiableCredentialsTable)
    .where(eq(verifiableCredentialsTable.credentialId, credentialId))
    .limit(1);

  if (!vc) {
    return { valid: false, reason: "Credential not found" };
  }

  const [ledgerEntry] = await db
    .select()
    .from(blockchainLedgerTable)
    .where(eq(blockchainLedgerTable.credentialId, credentialId))
    .limit(1);

  if (!ledgerEntry) {
    return { valid: false, reason: "Hash not found on blockchain" };
  }

  const hashMatch = ledgerEntry.hash === vc.hash;
  const isRevoked = vc.status === "revoked";

  return {
    valid: hashMatch && !isRevoked,
    tampered: !hashMatch,
    revoked: isRevoked,
    credentialId,
    type: vc.type,
    issuer: vc.issuer,
    issuanceDate: vc.issuanceDate,
    hash: vc.hash,
    blockchainHash: ledgerEntry.hash,
    txHash: ledgerEntry.txHash,
    blockNumber: ledgerEntry.blockNumber,
    network: ledgerEntry.network,
    anchoredAt: ledgerEntry.anchoredAt,
    reason: hashMatch && !isRevoked ? "Credential is authentic and verified on blockchain" : isRevoked ? "Credential has been revoked" : "Hash mismatch — credential may be tampered",
  };
}

export { sha256 };
