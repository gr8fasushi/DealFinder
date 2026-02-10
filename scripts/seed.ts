import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed Stores
  console.log("📦 Creating stores...");
  const storesData = await db
    .insert(schema.stores)
    .values([
      {
        name: "Amazon",
        slug: "amazon",
        logoUrl: "https://logo.clearbit.com/amazon.com",
        websiteUrl: "https://www.amazon.com",
        affiliateProgram: "amazon",
        isActive: true,
      },
      {
        name: "Walmart",
        slug: "walmart",
        logoUrl: "https://logo.clearbit.com/walmart.com",
        websiteUrl: "https://www.walmart.com",
        affiliateProgram: "walmart",
        isActive: true,
      },
      {
        name: "Newegg",
        slug: "newegg",
        logoUrl: "https://logo.clearbit.com/newegg.com",
        websiteUrl: "https://www.newegg.com",
        affiliateProgram: "newegg",
        isActive: true,
      },
      {
        name: "Best Buy",
        slug: "best-buy",
        logoUrl: "https://logo.clearbit.com/bestbuy.com",
        websiteUrl: "https://www.bestbuy.com",
        isActive: true,
      },
      {
        name: "Target",
        slug: "target",
        logoUrl: "https://logo.clearbit.com/target.com",
        websiteUrl: "https://www.target.com",
        isActive: true,
      },
    ])
    .returning();

  console.log(`✅ Created ${storesData.length} stores`);

  // Seed Categories
  console.log("📁 Creating categories...");
  const categoriesData = await db
    .insert(schema.categories)
    .values([
      {
        name: "Electronics",
        slug: "electronics",
        description: "TVs, computers, phones, and more",
      },
      {
        name: "Computers & Laptops",
        slug: "computers-laptops",
        description: "Desktop computers, laptops, and accessories",
      },
      {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        description: "Appliances, furniture, and home goods",
      },
      {
        name: "Gaming",
        slug: "gaming",
        description: "Video games, consoles, and gaming accessories",
      },
      {
        name: "Smart Home",
        slug: "smart-home",
        description: "Smart speakers, security cameras, and automation",
      },
      {
        name: "Audio",
        slug: "audio",
        description: "Headphones, speakers, and audio equipment",
      },
    ])
    .returning();

  console.log(`✅ Created ${categoriesData.length} categories`);

  // Seed Deals
  console.log("🎯 Creating sample deals...");
  const dealsData = await db
    .insert(schema.deals)
    .values([
      {
        title: "Apple AirPods Pro (2nd Generation)",
        description:
          "Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio with dynamic head tracking",
        imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
        storeId: storesData[0].id, // Amazon
        categoryId: categoriesData[5].id, // Audio
        originalPrice: "249.00",
        currentPrice: "199.99",
        savingsAmount: "49.01",
        savingsPercent: "19.68",
        productUrl: "https://www.amazon.com/dp/B0CHWRXH8B",
        affiliateUrl: "https://www.amazon.com/dp/B0CHWRXH8B?tag=dealfinder-20",
        externalId: "B0CHWRXH8B",
        brand: "Apple",
        isActive: true,
        isFeatured: true,
        source: "manual",
      },
      {
        title: 'Samsung 65" Class QLED 4K Q60C Smart TV',
        description:
          "Quantum Processor Lite 4K, Motion Xcelerator, Quantum HDR, Object Tracking Sound Lite",
        imageUrl: "https://image-us.samsung.com/SamsungUS/home/televisions-home-theater/televisions/qled-tvs/06032024/QN65Q60CAFXZA_001_Front_Black.jpg",
        storeId: storesData[1].id, // Walmart
        categoryId: categoriesData[0].id, // Electronics
        originalPrice: "799.99",
        currentPrice: "549.99",
        savingsAmount: "250.00",
        savingsPercent: "31.25",
        productUrl: "https://www.walmart.com/ip/Samsung-65-QLED-4K-Q60C/12345",
        affiliateUrl: "https://www.walmart.com/ip/Samsung-65-QLED-4K-Q60C/12345?affcampaignid=dealfinder",
        brand: "Samsung",
        isActive: true,
        isFeatured: true,
        source: "manual",
      },
      {
        title: "ASUS ROG Strix G16 Gaming Laptop",
        description:
          "16\" QHD 240Hz, Intel Core i9-13980HX, NVIDIA RTX 4070, 16GB DDR5, 1TB PCIe SSD",
        imageUrl: "https://dlcdnwebimgs.asus.com/gain/C0D54307-DAED-48A1-AE6E-8C20DC0890A3/w717/h525",
        storeId: storesData[2].id, // Newegg
        categoryId: categoriesData[1].id, // Computers
        originalPrice: "1999.99",
        currentPrice: "1499.99",
        savingsAmount: "500.00",
        savingsPercent: "25.00",
        productUrl: "https://www.newegg.com/p/N82E16834725155",
        affiliateUrl: "https://www.newegg.com/p/N82E16834725155?cm_mmc=dealfinder",
        externalId: "N82E16834725155",
        brand: "ASUS",
        isActive: true,
        source: "manual",
      },
      {
        title: "PlayStation 5 Console Slim",
        description:
          "Marvel's Spider-Man 2 Bundle - 1TB SSD, DualSense Wireless Controller",
        imageUrl: "https://m.media-amazon.com/images/I/51JN+P+3aPL._AC_SL1080_.jpg",
        storeId: storesData[3].id, // Best Buy
        categoryId: categoriesData[3].id, // Gaming
        originalPrice: "559.99",
        currentPrice: "449.99",
        savingsAmount: "110.00",
        savingsPercent: "19.64",
        productUrl: "https://www.bestbuy.com/site/playstation-5",
        affiliateUrl: "https://www.bestbuy.com/site/playstation-5?irclickid=dealfinder",
        brand: "Sony",
        isActive: true,
        isFeatured: true,
        source: "manual",
      },
      {
        title: "Amazon Echo Dot (5th Gen) Smart Speaker",
        description:
          "Alexa enabled, better sound, temperature sensor, Charcoal color",
        imageUrl: "https://m.media-amazon.com/images/I/71h3YN-71dL._AC_SL1000_.jpg",
        storeId: storesData[0].id, // Amazon
        categoryId: categoriesData[4].id, // Smart Home
        originalPrice: "49.99",
        currentPrice: "24.99",
        savingsAmount: "25.00",
        savingsPercent: "50.01",
        productUrl: "https://www.amazon.com/dp/B09B8V1LZ3",
        affiliateUrl: "https://www.amazon.com/dp/B09B8V1LZ3?tag=dealfinder-20",
        externalId: "B09B8V1LZ3",
        brand: "Amazon",
        isActive: true,
        source: "manual",
      },
      {
        title: "Ninja Air Fryer Pro 4-in-1",
        description:
          "Air Fry, Roast, Reheat, Dehydrate, 5-Quart Capacity, Nonstick Basket",
        imageUrl: "https://m.media-amazon.com/images/I/71dNEpLfNBL._AC_SL1500_.jpg",
        storeId: storesData[4].id, // Target
        categoryId: categoriesData[2].id, // Home & Kitchen
        originalPrice: "119.99",
        currentPrice: "79.99",
        savingsAmount: "40.00",
        savingsPercent: "33.34",
        productUrl: "https://www.target.com/p/ninja-air-fryer-pro",
        affiliateUrl: "https://www.target.com/p/ninja-air-fryer-pro?afid=dealfinder",
        brand: "Ninja",
        isActive: true,
        source: "manual",
      },
      {
        title: 'LG 27" UltraGear Gaming Monitor',
        description:
          "1ms Response Time, 144Hz Refresh Rate, IPS Display, HDR10, FreeSync Premium",
        imageUrl: "https://www.lg.com/us/images/monitors/md07527974/gallery/medium01.jpg",
        storeId: storesData[0].id, // Amazon
        categoryId: categoriesData[1].id, // Computers
        originalPrice: "299.99",
        currentPrice: "199.99",
        savingsAmount: "100.00",
        savingsPercent: "33.34",
        productUrl: "https://www.amazon.com/dp/B0B9YZZ",
        affiliateUrl: "https://www.amazon.com/dp/B0B9YZZ?tag=dealfinder-20",
        brand: "LG",
        isActive: true,
        source: "manual",
      },
      {
        title: "Sony WH-1000XM5 Wireless Headphones",
        description:
          "Industry-leading noise cancellation, 30-hour battery, multipoint connection, LDAC audio",
        imageUrl: "https://m.media-amazon.com/images/I/61vaBH+CbrL._AC_SL1500_.jpg",
        storeId: storesData[1].id, // Walmart
        categoryId: categoriesData[5].id, // Audio
        originalPrice: "399.99",
        currentPrice: "299.99",
        savingsAmount: "100.00",
        savingsPercent: "25.00",
        productUrl: "https://www.walmart.com/ip/Sony-WH1000XM5",
        affiliateUrl: "https://www.walmart.com/ip/Sony-WH1000XM5?affcampaignid=dealfinder",
        brand: "Sony",
        isActive: true,
        isFeatured: true,
        source: "manual",
      },
    ])
    .returning();

  console.log(`✅ Created ${dealsData.length} deals`);
  console.log("\n🎉 Database seeded successfully!\n");
  console.log("Summary:");
  console.log(`  - ${storesData.length} stores`);
  console.log(`  - ${categoriesData.length} categories`);
  console.log(`  - ${dealsData.length} deals`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:");
  console.error(err);
  process.exit(1);
});
