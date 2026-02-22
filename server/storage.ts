import { db } from "./db";
import { pets, type Pet, type InsertPet } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPets(): Promise<Pet[]>;
  getPetByUsername(username: string): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, updates: Partial<Pet>): Promise<Pet>;
}

export class DatabaseStorage implements IStorage {
  async getPets(): Promise<Pet[]> {
    return await db.select().from(pets);
  }
  async getPetByUsername(username: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.username, username));
    return pet;
  }
  async createPet(pet: InsertPet): Promise<Pet> {
    const [newPet] = await db.insert(pets).values(pet).returning();
    return newPet;
  }
  async updatePet(id: number, updates: Partial<Pet>): Promise<Pet> {
    const [updated] = await db.update(pets).set(updates).where(eq(pets.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
