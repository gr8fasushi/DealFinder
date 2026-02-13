import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedDeal, ScraperResult } from "./types";
import {
  getRandomUserAgent,
  parsePrice,
  sanitizeUrl,
  truncate,
} from "./utils";

const BASE_URL = "https://www.newegg.com";
const DEALS_URL = `${BASE_URL}/todays-deals`;

export async function scrapeNewegg(): Promise<ScraperResult> {
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

    // Newegg uses .item-cell or .item-container for product listings
    const selectors = [
      ".item-cell",
      ".item-container",
      '[class*="product-card"]',
      ".goods-container .goods-item",
    ];

    for (const selector of selectors) {
      const items = $(selector);
      if (items.length > 0) {
        items.each((_index, element) => {
          const deal = parseNeweggItem($, element);
          if (deal) deals.push(deal);
        });
        break;
      }
    }

    return {
      source: "newegg",
      status: deals.length > 0 ? "success" : "partial",
      deals,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[Newegg Scraper] Error:", message);
    return {
      source: "newegg",
      status: "failed",
      deals: [],
      error: message,
      duration: Date.now() - startTime,
    };
  }
}

function parseNeweggItem(
  $: cheerio.CheerioAPI,
  element: cheerio.Element
): ScrapedDeal | null {
  try {
    const $el = $(element);

    // Product link and ID
    const link =
      $el.find("a.item-title").attr("href") ||
      $el.find("a[href*='/p/']").attr("href") ||
      $el.find("a").first().attr("href");
    if (!link) return null;

    // Extract Newegg item number from URL
    const itemMatch = link.match(/\/p\/([\w-]+)/i) || link.match(/Item=([\w-]+)/i);
    const itemId = itemMatch ? itemMatch[1] : null;
    if (!itemId) return null;

    // Title
    const title =
      $el.find("a.item-title").text().trim() ||
      $el.find(".item-info a").first().text().trim() ||
      $el.find("a[title]").attr("title")?.trim();
    if (!title) return null;

    // Current price
    const priceWhole = $el.find(".price-current strong").text().trim();
    const priceFraction = $el.find(".price-current sup").text().trim().replace(/^\./, ""); // Remove leading dot if present
    let currentPrice: number | null = null;

    if (priceWhole) {
      currentPrice = parsePrice(`${priceWhole}.${priceFraction || "00"}`);
    } else {
      const priceText =
        $el.find(".price-current").text().trim() ||
        $el.find('[class*="price"]').first().text().trim();
      currentPrice = parsePrice(priceText);
    }

    if (!currentPrice) return null;

    // Original price (was price)
    const wasPriceText = $el.find(".price-was").text().trim();
    const originalPrice = parsePrice(wasPriceText) ?? undefined;

    // Image
    const imageUrl =
      $el.find("img.item-img").attr("src") ||
      $el.find("a.item-img img").attr("src") ||
      $el.find("img").first().attr("src") ||
      undefined;

    // Brand
    const brand =
      $el.find(".item-brand img").attr("alt")?.trim() ||
      $el.find(".item-brand").text().trim() ||
      undefined;

    const productUrl = sanitizeUrl(link, BASE_URL);

    return {
      externalId: `newegg-${itemId}`,
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

export { parseNeweggItem as _parseNeweggItem };
