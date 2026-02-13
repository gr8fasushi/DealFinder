import { db } from "@/lib/db";
import { deals, stores, scraperLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { scrapeWalmart } from "./walmart-scraper";
import { scrapeNewegg } from "./newegg-scraper";
import { scrapeAmazon } from "./amazon-scraper";
import { calculateSavings, randomDelay } from "./utils";
import type { ScrapedDeal, ScraperResult, CoordinatorResult } from "./types";

type SourceName = "walmart" | "newegg" | "amazon";

const SCRAPERS: Record<SourceName, () => Promise<ScraperResult>> = {
  walmart: scrapeWalmart,
  newegg: scrapeNewegg,
  amazon: scrapeAmazon,
};

// Cache store IDs so we don't query every time
let storeIdCache: Record<string, number> | null = null;

async function getStoreIds(): Promise<Record<string, number>> {
  if (storeIdCache) return storeIdCache;

  const allStores = await db
    .select({ id: stores.id, slug: stores.slug })
    .from(stores)
    .where(eq(stores.isActive, true));

  storeIdCache = {};
  for (const store of allStores) {
    storeIdCache[store.slug] = store.id;
  }
  return storeIdCache;
}

function getStoreIdForSource(
  source: string,
  storeIds: Record<string, number>
): number | null {
  // Map scraper source names to store slugs
  const sourceToSlug: Record<string, string> = {
    walmart: "walmart",
    newegg: "newegg",
    amazon: "amazon",
  };
  const slug = sourceToSlug[source];
  return slug ? storeIds[slug] ?? null : null;
}

export async function runScrapers(
  sources?: SourceName[]
): Promise<CoordinatorResult> {
  const sourcesToRun = sources ?? (Object.keys(SCRAPERS) as SourceName[]);
  const storeIds = await getStoreIds();

  const results: ScraperResult[] = [];
  let totalFound = 0;
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalExpired = 0;

  for (const source of sourcesToRun) {
    const scraper = SCRAPERS[source];
    if (!scraper) {
      console.warn(`[Coordinator] Unknown source: ${source}`);
      continue;
    }

    const storeId = getStoreIdForSource(source, storeIds);
    if (!storeId) {
      console.warn(
        `[Coordinator] No store found for source: ${source}. Create the store first.`
      );
      results.push({
        source,
        status: "failed",
        deals: [],
        error: `No store found for source "${source}". Create the store in the admin panel first.`,
        duration: 0,
      });
      continue;
    }

    console.log(`[Coordinator] Running ${source} scraper...`);
    const startedAt = new Date();
    const result = await scraper();
    results.push(result);

    totalFound += result.deals.length;

    // Upsert deals into DB
    if (result.deals.length > 0) {
      const { added, updated } = await upsertDeals(
        result.deals,
        storeId,
        source
      );
      totalAdded += added;
      totalUpdated += updated;

      // Expire deals that weren't found in this scrape
      const expired = await expireMissingDeals(
        result.deals,
        storeId,
        source
      );
      totalExpired += expired;
    }

    // Log scraper run
    await db.insert(scraperLogs).values({
      source,
      status: result.status,
      dealsFound: result.deals.length,
      dealsAdded: totalAdded,
      dealsUpdated: totalUpdated,
      errorMessage: result.error ?? null,
      duration: result.duration,
      startedAt,
      completedAt: new Date(),
    });

    // Delay between scrapers to be polite
    if (sourcesToRun.indexOf(source) < sourcesToRun.length - 1) {
      await randomDelay(1500, 3000);
    }
  }

  // Clear store cache after run
  storeIdCache = null;

  return { results, totalFound, totalAdded, totalUpdated, totalExpired };
}

async function upsertDeals(
  scrapedDeals: ScrapedDeal[],
  storeId: number,
  source: string
): Promise<{ added: number; updated: number }> {
  let added = 0;
  let updated = 0;
  let featuredCount = 0;

  for (const scraped of scrapedDeals) {
    try {
      // Check if deal already exists
      const existing = await db.query.deals.findFirst({
        where: and(
          eq(deals.externalId, scraped.externalId),
          eq(deals.storeId, storeId)
        ),
      });

      const savings = calculateSavings(scraped.currentPrice, scraped.originalPrice);

      // Mark as featured if discount is 20% or more
      const isFeatured = savings ? savings.savingsPercent >= 20 : false;
      if (isFeatured) featuredCount++;

      if (existing) {
        // Update existing deal - reactivate if it was expired
        await db
          .update(deals)
          .set({
            title: scraped.title,
            description: scraped.description ?? null,
            imageUrl: scraped.imageUrl ?? existing.imageUrl,
            currentPrice: scraped.currentPrice.toFixed(2),
            originalPrice: scraped.originalPrice?.toFixed(2) ?? existing.originalPrice,
            savingsAmount: savings?.savingsAmount.toFixed(2) ?? existing.savingsAmount,
            savingsPercent: savings?.savingsPercent.toFixed(2) ?? existing.savingsPercent,
            productUrl: scraped.productUrl,
            affiliateUrl: scraped.productUrl,
            brand: scraped.brand ?? existing.brand,
            sku: scraped.sku ?? existing.sku,
            isActive: true,
            isFeatured,
            expiresAt: null, // Clear expiration if deal is back
            source: "scraper",
            updatedAt: new Date(),
          })
          .where(eq(deals.id, existing.id));
        updated++;
      } else {
        // Insert new deal
        await db.insert(deals).values({
          title: scraped.title,
          description: scraped.description ?? null,
          imageUrl: scraped.imageUrl ?? null,
          storeId,
          currentPrice: scraped.currentPrice.toFixed(2),
          originalPrice: scraped.originalPrice?.toFixed(2) ?? null,
          savingsAmount: savings?.savingsAmount.toFixed(2) ?? null,
          savingsPercent: savings?.savingsPercent.toFixed(2) ?? null,
          productUrl: scraped.productUrl,
          affiliateUrl: scraped.productUrl,
          externalId: scraped.externalId,
          brand: scraped.brand ?? null,
          sku: scraped.sku ?? null,
          isActive: true,
          isFeatured,
          source: "scraper",
        });
        added++;
      }
    } catch (error) {
      console.error(
        `[Coordinator] Error upserting deal ${scraped.externalId}:`,
        error
      );
    }
  }

  console.log(
    `[Coordinator] Featured deals (≥20% off): ${featuredCount}/${scrapedDeals.length}`
  );

  return { added, updated };
}

async function expireMissingDeals(
  scrapedDeals: ScrapedDeal[],
  storeId: number,
  source: string
): Promise<number> {
  try {
    // Get external IDs of deals found in this scrape
    const foundExternalIds = scrapedDeals.map((deal) => deal.externalId);

    // Find active deals from this store/source that weren't in the scrape
    const activeDeals = await db.query.deals.findMany({
      where: and(
        eq(deals.storeId, storeId),
        eq(deals.isActive, true),
        eq(deals.source, "scraper")
      ),
    });

    const now = new Date();
    let expired = 0;

    for (const deal of activeDeals) {
      if (deal.externalId && !foundExternalIds.includes(deal.externalId)) {
        // Deal wasn't found in this scrape - mark as expired
        await db
          .update(deals)
          .set({
            isActive: false,
            expiresAt: now,
            updatedAt: now,
          })
          .where(eq(deals.id, deal.id));
        expired++;
      }
    }

    if (expired > 0) {
      console.log(
        `[Coordinator] Expired ${expired} deals from ${source} that were not found`
      );
    }

    return expired;
  } catch (error) {
    console.error(`[Coordinator] Error expiring missing deals:`, error);
    return 0;
  }
}
