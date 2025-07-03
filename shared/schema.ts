import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  budget: text("budget"),
  downPayment: text("down_payment"),
  whatInMind: text("what_in_mind"),
  projectSlug: text("project_slug"),
  createdAt: timestamp("created_at").defaultNow(),
  appointmentDate: timestamp("appointment_date"),
  calendlyEventId: text("calendly_event_id").unique(),
  calendlyStatus: text("calendly_status").default("pending"),
  calendlyInviteeName: text("calendly_invitee_name"),
  calendlyRawPayload: jsonb("calendly_raw_payload"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  location: text("location").notNull(),
  completion: text("completion").notNull(),
  features: text("features").array().notNull(),
  imageUrl: text("image_url").notNull(), // Main image for homepage
  images: text("images").array().notNull().default(['[]']), // Array of all project images for carousel
  pdfUrl: text("pdf_url"),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
