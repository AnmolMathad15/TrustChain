import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const didDocumentsTable = pgTable("did_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  did: text("did").notNull().unique(),
  publicKey: text("public_key").notNull(),
  document: text("document").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDidDocumentSchema = createInsertSchema(didDocumentsTable).omit({ id: true, createdAt: true });
export type InsertDidDocument = z.infer<typeof insertDidDocumentSchema>;
export type DidDocument = typeof didDocumentsTable.$inferSelect;

export const verifiableCredentialsTable = pgTable("verifiable_credentials", {
  id: serial("id").primaryKey(),
  credentialId: text("credential_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  documentId: integer("document_id"),
  type: text("type").notNull(),
  issuer: text("issuer").notNull(),
  issuanceDate: text("issuance_date").notNull(),
  credentialSubject: text("credential_subject").notNull(),
  proof: text("proof").notNull(),
  hash: text("hash").notNull(),
  ipfsCid: text("ipfs_cid").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVCSchema = createInsertSchema(verifiableCredentialsTable).omit({ id: true, createdAt: true });
export type InsertVC = z.infer<typeof insertVCSchema>;
export type VerifiableCredential = typeof verifiableCredentialsTable.$inferSelect;

export const blockchainLedgerTable = pgTable("blockchain_ledger", {
  id: serial("id").primaryKey(),
  credentialId: text("credential_id").notNull().unique(),
  hash: text("hash").notNull(),
  txHash: text("tx_hash").notNull(),
  blockNumber: integer("block_number").notNull(),
  network: text("network").notNull().default("polygon-mumbai"),
  anchoredAt: timestamp("anchored_at").notNull().defaultNow(),
});

export const insertLedgerSchema = createInsertSchema(blockchainLedgerTable).omit({ id: true, anchoredAt: true });
export type InsertLedgerEntry = z.infer<typeof insertLedgerSchema>;
export type LedgerEntry = typeof blockchainLedgerTable.$inferSelect;
