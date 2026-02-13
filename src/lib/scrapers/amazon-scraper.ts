import type { ScraperResult } from "./types";

/**
 * Amazon scraper stub.
 * Amazon has aggressive anti-scraping measures that make HTML scraping unreliable.
 * Use the Product Advertising API (PA-API) when an API key is available.
 * Set AMAZON_API_KEY and AMAZON_API_SECRET env vars to enable.
 */
export async function scrapeAmazon(): Promise<ScraperResult> {
  const startTime = Date.now();

  console.log(
    "[Amazon Scraper] Skipped — Amazon requires PA-API. Set AMAZON_API_KEY to enable."
  );

  return {
    source: "amazon",
    status: "partial",
    deals: [],
    error: "Amazon scraping requires PA-API credentials. Set AMAZON_API_KEY and AMAZON_API_SECRET environment variables.",
    duration: Date.now() - startTime,
  };
}
