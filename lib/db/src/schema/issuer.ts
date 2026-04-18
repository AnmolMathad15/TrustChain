import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trustedIssuersTable = pgTable("trusted_issuers", {
  id: serial("id").primaryKey(),
  orgName: text("org_name").notNull(),
  orgType: text("org_type").notNull(),
  did: text("did").notNull().unique(),
  walletAddress: text("wallet_address"),
  reputationScore: integer("reputation_score").notNull().default(100),
  isApproved: boolean("is_approved").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  polygonTxHash: text("polygon_tx_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTrustedIssuerSchema = createInsertSchema(trustedIssuersTable).omit({ id: true, createdAt: true });
export type InsertTrustedIssuer = z.infer<typeof insertTrustedIssuerSchema>;
export type TrustedIssuer = typeof trustedIssuersTable.$inferSelect;

export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  orgName: text("org_name").notNull(),
  verifierDid: text("verifier_did").notNull(),
  tier: text("tier").notNull().default("starter"),
  usageCount: integer("usage_count").notNull().default(0),
  monthlyLimit: integer("monthly_limit").notNull().default(500),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApiKeySchema = createInsertSchema(apiKeysTable).omit({ id: true, createdAt: true, usageCount: true });
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeysTable.$inferSelect;

export const verificationLogsTable = pgTable("verification_logs", {
  id: serial("id").primaryKey(),
  credentialId: text("credential_id").notNull(),
  verifierDid: text("verifier_did").notNull(),
  verifierOrg: text("verifier_org"),
  result: boolean("result").notNull(),
  failureReason: text("failure_reason"),
  verifiedAt: timestamp("verified_at").notNull().defaultNow(),
});

export const insertVerificationLogSchema = createInsertSchema(verificationLogsTable).omit({ id: true, verifiedAt: true });
export type InsertVerificationLog = z.infer<typeof insertVerificationLogSchema>;
export type VerificationLog = typeof verificationLogsTable.$inferSelect;
