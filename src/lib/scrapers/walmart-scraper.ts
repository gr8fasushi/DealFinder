import axios from "axios";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { ScrapedDeal, ScraperResult } from "./types";
import {
  getRandomUserAgent,
  parsePrice,
  sanitizeUrl,
  randomDelay,
  truncate,
} from "./utils";

const BASE_URL = "https://www.walmart.com";
const DEALS_URL = `${BASE_URL}/shop/deals`;

export async function scrapeWalmart(): Promise<ScraperResult> {
  const startTime = Date.now();
  const deals: ScrapedDeal[] = [];

  try {
    const response = await axios.get(DEALS_URL, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    // Walmart renders deals in product card containers
    // Try multiple selectors since the page structure can change
    const selectors = [
      '[data-testid="item-stack"] [data-item-id]',
      ".search-result-gridview-item",
      '[data-automation-id="product-card"]',
      ".sans-serif.mid-gray",
    ];

    let foundItems = false;

    for (const selector of selectors) {
      const items = $(selector);
      if (items.length > 0) {
        foundItems = true;
        items.each((_index, element) => {
          const deal = parseWalmartItem($, element as Element);
          if (deal) deals.push(deal);
        });
        break;
      }
    }

    // Fallback: try to extract from embedded JSON data (Walmart often uses __NEXT_DATA__)
    if (!foundItems) {
      const scriptData = $('script#__NEXT_DATA__').text();
      if (scriptData) {
        try {
          const jsonData = JSON.parse(scriptData);
          const extractedDeals = extractFromWalmartJson(jsonData);
          deals.push(...extractedDeals);
        } catch {
          // JSON parsing failed, continue
        }
      }
    }

    // Debug: Log deals with/without discounts
    const withDiscounts = deals.filter(d => d.originalPrice).length;
    console.log(`[Walmart Scraper] Found ${deals.length} deals, ${withDiscounts} with original prices`);

    // Hybrid approach: Enrich top 10 deals with individual page data
    if (deals.length > 0) {
      const dealsToEnrich = deals.slice(0, 10);
      console.log(`[Walmart Scraper] Enriching top ${dealsToEnrich.length} deals with individual page data...`);

      for (let i = 0; i < dealsToEnrich.length; i++) {
        const deal = dealsToEnrich[i];
        const enrichedDeal = await enrichDealFromProductPage(deal);
        if (enrichedDeal) {
          deals[i] = enrichedDeal;
        }
        // Small delay between requests to be polite
        if (i < dealsToEnrich.length - 1) {
          await randomDelay(500, 1000);
        }
      }

      const enrichedWithDiscounts = deals.filter(d => d.originalPrice).length;
      console.log(`[Walmart Scraper] After enrichment: ${enrichedWithDiscounts} deals with original prices`);
    }

    return {
      source: "walmart",
      status: deals.length > 0 ? "success" : "partial",
      deals,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[Walmart Scraper] Error:", message);
    return {
      source: "walmart",
      status: "failed",
      deals: [],
      error: message,
      duration: Date.now() - startTime,
    };
  }
}

function parseWalmartItem(
  $: cheerio.CheerioAPI,
  element: Element
): ScrapedDeal | null {
  try {
    const $el = $(element);

    // Extract product ID
    const itemId =
      $el.attr("data-item-id") || $el.find("[data-item-id]").attr("data-item-id");
    if (!itemId) return null;

    // Title
    const title =
      $el.find('[data-automation-id="product-title"]').text().trim() ||
      $el.find("a span").first().text().trim();
    if (!title) return null;

    // Current price
    const priceText =
      $el.find('[data-automation-id="product-price"] .f2').text() ||
      $el.find('[itemprop="price"]').attr("content") ||
      $el.find(".price-main .visuallyhidden").text();
    const currentPrice = parsePrice(priceText);
    if (!currentPrice) return null;

    // Original price (was price) - try multiple selectors
    const wasPriceText =
      $el.find(".price-old .visuallyhidden").text() ||
      $el.find('[data-automation-id="strikethrough-price"]').text() ||
      $el.find('[data-automation-id="was-price"]').text() ||
      $el.find('.w_iUH7 [aria-label*="Was"]').text() ||
      $el.find('.strike-through').text() ||
      $el.find('[class*="strikethrough"]').text() ||
      $el.find('[class*="was-price"]').text();
    const originalPrice = parsePrice(wasPriceText) ?? undefined;

    // Debug logging for this specific product
    if (itemId === "6644560775") {
      console.log(`[Walmart Debug] Product ${itemId}:`, {
        title: title.substring(0, 50),
        currentPrice,
        wasPriceText,
        originalPrice,
        allPriceElements: $el.find('[class*="price"]').map((_, el) => ({
          class: $(el).attr('class'),
          text: $(el).text().trim().substring(0, 50)
        })).get()
      });
    }

    // Image
    const imageUrl =
      $el.find("img[data-testid]").attr("src") ||
      $el.find("img").first().attr("src") ||
      undefined;

    // Product URL
    const linkHref =
      $el.find("a[href*='/ip/']").attr("href") ||
      $el.find("a").first().attr("href");
    const productUrl = linkHref
      ? sanitizeUrl(linkHref, BASE_URL)
      : `${BASE_URL}/ip/${itemId}`;

    // Brand
    const brand = $el.find('[data-automation-id="product-brand"]').text().trim() || undefined;

    return {
      externalId: `walmart-${itemId}`,
      title: truncate(title, 500),
      imageUrl: imageUrl ? sanitizeUrl(imageUrl, BASE_URL) : undefined,
      currentPrice,
      originalPrice,
      productUrl,
      brand,
    };
  } catch {
    return null;
  }
}

function extractFromWalmartJson(data: Record<string, unknown>): ScrapedDeal[] {
  const deals: ScrapedDeal[] = [];

  try {
    // Navigate common Walmart JSON structures
    const items = findItemsInJson(data);
    for (const item of items) {
      const id = item.usItemId || item.id || item.productId;
      const title = item.name || item.title;
      const price =
        item.priceInfo?.currentPrice?.price ??
        item.currentPrice ??
        item.price;

      if (!id || !title || !price) continue;

      const originalPrice =
        item.priceInfo?.wasPrice?.price ??
        item.priceInfo?.listPrice?.price ??
        item.wasPrice ??
        item.listPrice ??
        item.originalPrice ??
        undefined;

      deals.push({
        externalId: `walmart-${id}`,
        title: truncate(String(title), 500),
        imageUrl: item.imageUrl || item.image || item.thumbnailUrl || undefined,
        currentPrice: typeof price === "number" ? price : parsePrice(String(price)) ?? 0,
        originalPrice:
          originalPrice != null
            ? typeof originalPrice === "number"
              ? originalPrice
              : parsePrice(String(originalPrice)) ?? undefined
            : undefined,
        productUrl: `${BASE_URL}/ip/${id}`,
        brand: item.brand || undefined,
      });
    }
  } catch {
    // Failed to extract from JSON
  }

  return deals;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findItemsInJson(obj: any, depth: number = 0): any[] {
  if (depth > 10 || !obj || typeof obj !== "object") return [];

  // Look for arrays of items with product-like properties
  if (Array.isArray(obj)) {
    const hasProducts = obj.some(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.usItemId || item.productId) &&
        (item.name || item.title)
    );
    if (hasProducts) return obj;
  }

  // Recurse into object properties
  const results: unknown[] = [];
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findItemsInJson(value, depth + 1);
      if (found.length > 0) return found;
    }
  }

  return results;
}

/**
 * Enriches a deal with data from its individual product page
 * to get accurate pricing information
 */
async function enrichDealFromProductPage(deal: ScrapedDeal): Promise<ScrapedDeal | null> {
  try {
    const response = await axios.get(deal.productUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Try to extract pricing from the product page
    // Walmart embeds data in JSON-LD schema or __NEXT_DATA__

    // Method 1: JSON-LD schema
    const jsonLdScript = $('script[type="application/ld+json"]').first().html();
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript);
        const offers = jsonLd.offers || jsonLd;

        if (offers.price) {
          const currentPrice = parseFloat(offers.price);
          const highPrice = offers.highPrice ? parseFloat(offers.highPrice) : null;

          if (currentPrice && highPrice && highPrice > currentPrice) {
            return {
              ...deal,
              currentPrice,
              originalPrice: highPrice,
            };
          }
        }
      } catch (e) {
        // JSON-LD parsing failed, continue to next method
      }
    }

    // Method 2: __NEXT_DATA__ script tag
    const nextDataScript = $('script#__NEXT_DATA__').html();
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript);

        // Navigate to product data
        const findPricing = (obj: any, depth = 0): any => {
          if (depth > 10 || !obj || typeof obj !== "object") return null;

          // Look for priceInfo structure
          if (obj.priceInfo) {
            const current = obj.priceInfo.currentPrice?.price;
            const was = obj.priceInfo.wasPrice?.price || obj.priceInfo.listPrice?.price;

            if (current && was && was > current) {
              return { current, was };
            }
          }

          // Recurse
          for (const value of Object.values(obj)) {
            const result = findPricing(value, depth + 1);
            if (result) return result;
          }

          return null;
        };

        const pricing = findPricing(nextData);
        if (pricing) {
          return {
            ...deal,
            currentPrice: pricing.current,
            originalPrice: pricing.was,
          };
        }
      } catch (e) {
        // __NEXT_DATA__ parsing failed
      }
    }

    // If we couldn't find better pricing, return original deal
    return deal;
  } catch (error) {
    console.error(`[Walmart Enrichment] Failed for ${deal.externalId}:`, error instanceof Error ? error.message : 'Unknown error');
    return deal; // Return original deal if enrichment fails
  }
}

// Allow importing the delay for use between scraper calls
export { randomDelay };
