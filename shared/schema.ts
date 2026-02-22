import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  petType: text("pet_type").notNull().default("cat"),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  health: integer("health").notNull().default(100),
  lastAction: timestamp("last_action"),
});

export const insertPetSchema = createInsertSchema(pets).omit({ id: true, lastAction: true });
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

export type WsMessage = 
  | { type: 'state'; payload: { pets: Pet[] } }
  | { type: 'spawn'; payload: Pet }
  | { type: 'action'; payload: { username: string; action: string; result: string; newScore: number, newLevel?: number, newExp?: number, newHealth?: number } }
  | { type: 'event'; payload: { message: string } };
