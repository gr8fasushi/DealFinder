import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql, { schema });

async function checkImages() {
  const deals = await db.query.deals.findMany({
    columns: {
      id: true,
      title: true,
      imageUrl: true,
    },
  });

  console.log("Current deal images:");
  deals.forEach((deal) => {
    console.log(`\n${deal.id}. ${deal.title}`);
    console.log(`   Image: ${deal.imageUrl}`);
  });

  process.exit(0);
}

checkImages();
