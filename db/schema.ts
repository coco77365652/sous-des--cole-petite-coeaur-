import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
