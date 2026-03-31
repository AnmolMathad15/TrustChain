import { pgTable, serial, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const healthProfilesTable = pgTable("health_profiles", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull().unique(),
  bloodGroup: text("blood_group").notNull(),
  height: real("height"),
  weight: real("weight"),
  allergies: jsonb("allergies").notNull().default([]),
  conditions: jsonb("conditions").notNull().default([]),
  lastCheckup: timestamp("last_checkup"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHealthProfileSchema = createInsertSchema(healthProfilesTable).omit({ id: true, createdAt: true });
export type InsertHealthProfile = z.infer<typeof insertHealthProfileSchema>;
export type HealthProfile = typeof healthProfilesTable.$inferSelect;

export const healthRecordsTable = pgTable("health_records", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull().defaultNow(),
  doctor: text("doctor"),
  hospital: text("hospital"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHealthRecordSchema = createInsertSchema(healthRecordsTable).omit({ id: true, createdAt: true });
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecordsTable.$inferSelect;
