import { pgTable, serial, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const governmentFormsTable = pgTable("government_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  estimatedTime: text("estimated_time").notNull(),
  isPopular: boolean("is_popular").notNull().default(false),
  fields: jsonb("fields").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGovernmentFormSchema = createInsertSchema(governmentFormsTable).omit({ id: true, createdAt: true });
export type InsertGovernmentForm = z.infer<typeof insertGovernmentFormSchema>;
export type GovernmentForm = typeof governmentFormsTable.$inferSelect;

export const formSubmissionsTable = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  formId: serial("form_id").notNull(),
  referenceNumber: text("reference_number").notNull(),
  data: jsonb("data").notNull(),
  status: text("status").notNull().default("submitted"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
