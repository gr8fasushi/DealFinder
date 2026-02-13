import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios before importing the scraper
vi.mock("axios");

import axios from "axios";
import { scrapeNewegg } from "@/lib/scrapers/newegg-scraper";

const mockAxios = vi.mocked(axios);

beforeEach(() => {
  vi.clearAllMocks();
});

// Sample Newegg-like HTML with product items
const NEWEGG_HTML_WITH_ITEMS = `
<html>
<body>
  <div class="item-cell">
    <a class="item-title" href="/p/N82E16834233441">ASUS Gaming Laptop</a>
    <div class="price-current">
      <strong>899</strong>
      <sup>.99</sup>
    </div>
    <div class="price-was">Was: $1,199.99</div>
    <img class="item-img" src="https://c1.neweggimages.com/laptop.jpg" />
    <div class="item-brand">
      <img alt="ASUS" />
    </div>
  </div>

  <div class="item-cell">
    <a class="item-title" href="/p/9SIAKVKJSR4321">Mechanical Keyboard RGB</a>
    <div class="price-current">$79.99</div>
    <img src="https://c1.neweggimages.com/keyboard.jpg" />
  </div>
</body>
</html>
`;

const NEWEGG_EMPTY_HTML = `
<html>
<body>
  <div class="container">
    <p>No deals found</p>
  </div>
</body>
</html>
`;

describe("scrapeNewegg", () => {
  it("extracts deals from item-cell elements", async () => {
    mockAxios.get.mockResolvedValueOnce({ data: NEWEGG_HTML_WITH_ITEMS });

    const result = await scrapeNewegg();

    expect(result.source).toBe("newegg");
    expect(result.status).toBe("success");
    expect(result.deals.length).toBe(2);

    const laptop = result.deals[0];
    expect(laptop.externalId).toBe("newegg-N82E16834233441");
    expect(laptop.title).toBe("ASUS Gaming Laptop");
    expect(laptop.currentPrice).toBe(899.99);
    expect(laptop.originalPrice).toBe(1199.99);
    expect(laptop.brand).toBe("ASUS");
    expect(laptop.imageUrl).toContain("neweggimages.com");

    const keyboard = result.deals[1];
    expect(keyboard.externalId).toBe("newegg-9SIAKVKJSR4321");
    expect(keyboard.title).toBe("Mechanical Keyboard RGB");
    expect(keyboard.currentPrice).toBe(79.99);
    expect(keyboard.originalPrice).toBeUndefined();
  });

  it("handles price-current with strong/sup structure", async () => {
    const html = `
      <div class="item-cell">
        <a class="item-title" href="/p/ABC123">Test Product</a>
        <div class="price-current">
          <strong>1299</strong>
          <sup>.00</sup>
        </div>
      </div>
    `;
    mockAxios.get.mockResolvedValueOnce({ data: html });

    const result = await scrapeNewegg();

    expect(result.deals[0].currentPrice).toBe(1299);
  });

  it("returns failed status on network error", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("Connection refused"));

    const result = await scrapeNewegg();

    expect(result.source).toBe("newegg");
    expect(result.status).toBe("failed");
    expect(result.deals).toHaveLength(0);
    expect(result.error).toBe("Connection refused");
  });

  it("returns partial status when no deals found", async () => {
    mockAxios.get.mockResolvedValueOnce({ data: NEWEGG_EMPTY_HTML });

    const result = await scrapeNewegg();

    expect(result.source).toBe("newegg");
    expect(result.status).toBe("partial");
    expect(result.deals).toHaveLength(0);
  });

  it("includes duration in results", async () => {
    mockAxios.get.mockResolvedValueOnce({ data: NEWEGG_EMPTY_HTML });

    const result = await scrapeNewegg();

    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration).toBe("number");
  });

  it("handles missing optional fields gracefully", async () => {
    const html = `
      <div class="item-cell">
        <a class="item-title" href="/p/XYZ999">Minimal Product</a>
        <div class="price-current">$49.99</div>
      </div>
    `;
    mockAxios.get.mockResolvedValueOnce({ data: html });

    const result = await scrapeNewegg();

    expect(result.deals[0]).toMatchObject({
      externalId: "newegg-XYZ999",
      title: "Minimal Product",
      currentPrice: 49.99,
    });
    expect(result.deals[0].originalPrice).toBeUndefined();
    expect(result.deals[0].brand).toBeUndefined();
  });
});
