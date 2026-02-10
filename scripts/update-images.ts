import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import * as dotenv from "dotenv";
import { eq, like } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql, { schema });

async function updateImages() {
  console.log("🖼️  Updating deal images to working URLs...");

  // Update each deal with placeholder images
  await db
    .update(schema.deals)
    .set({ imageUrl: "https://placehold.co/600x600/EEE/31343C?font=open-sans&text=Samsung+65%22+TV" })
    .where(like(schema.deals.title, "%Samsung%"));

  await db
    .update(schema.deals)
    .set({ imageUrl: "https://placehold.co/600x600/EEE/31343C?font=open-sans&text=ASUS+Gaming+Laptop" })
    .where(like(schema.deals.title, "%ASUS%"));

  await db
    .update(schema.deals)
    .set({ imageUrl: "https://placehold.co/600x600/EEE/31343C?font=open-sans&text=PlayStation+5" })
    .where(like(schema.deals.title, "%PlayStation%"));

  await db
    .update(schema.deals)
    .set({ imageUrl: "https://placehold.co/600x600/EEE/31343C?font=open-sans&text=Echo+Dot+5th+Gen" })
    .where(like(schema.deals.title, "%Echo Dot%"));

  await db
    .update(schema.deals)
    .set({ imageUrl: "https://placehold.co/600x600/EEE/31343C?font=open-sans&text=Ninja+Air+Fryer" })
    .where(like(schema.deals.title, "%Ninja%"));

  await db
    .update(schema.deals)
    .set({ imageUrl: "https://placehold.co/600x600/EEE/31343C?font=open-sans&text=LG+27%22+Monitor" })
    .where(like(schema.deals.title, "%LG%"));

  await db
    .update(schema.deals)
    .set({ imageUrl: "https://placehold.co/600x600/EEE/31343C?font=open-sans&text=Sony+WH-1000XM5" })
    .where(like(schema.deals.title, "%Sony%"));

  console.log("✅ Images updated!");
  process.exit(0);
}

updateImages().catch((err) => {
  console.error("❌ Update failed:", err);
  process.exit(1);
});
