import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios before importing the scraper
vi.mock("axios");

import axios from "axios";
import { scrapeWalmart } from "@/lib/scrapers/walmart-scraper";

const mockAxios = vi.mocked(axios);
const mockGet = mockAxios.get as any;

beforeEach(() => {
  vi.clearAllMocks();
});

// Sample Walmart-like HTML with product items
const WALMART_HTML_WITH_NEXT_DATA = `
<html>
<head><title>Walmart Deals</title></head>
<body>
  <script id="__NEXT_DATA__" type="application/json">
  {
    "props": {
      "pageProps": {
        "initialData": {
          "searchResult": {
            "itemStacks": [{
              "items": [
                {
                  "usItemId": "123456",
                  "name": "Samsung 65 inch 4K TV",
                  "priceInfo": {
                    "currentPrice": { "price": 499.99 },
                    "wasPrice": { "price": 799.99 }
                  },
                  "imageUrl": "https://i5.walmartimages.com/tv.jpg",
                  "brand": "Samsung"
                },
                {
                  "usItemId": "789012",
                  "name": "Sony Headphones WH-1000XM5",
                  "priceInfo": {
                    "currentPrice": { "price": 278.00 }
                  },
                  "imageUrl": "https://i5.walmartimages.com/headphones.jpg",
                  "brand": "Sony"
                }
              ]
            }]
          }
        }
      }
    }
  }
  </script>
</body>
</html>
`;

const WALMART_HTML_WITH_ITEMS = `
<html>
<body>
  <div data-testid="item-stack">
    <div data-item-id="AAA111">
      <a href="/ip/AAA111">
        <span>Great Laptop Deal</span>
      </a>
      <span itemprop="price" content="599.99"></span>
      <img data-testid="product-image" src="https://i5.walmartimages.com/laptop.jpg" />
    </div>
  </div>
</body>
</html>
`;

describe("scrapeWalmart", () => {
  it("extracts deals from __NEXT_DATA__ JSON", async () => {
    mockGet.mockResolvedValueOnce({ data: WALMART_HTML_WITH_NEXT_DATA });

    const result = await scrapeWalmart();

    expect(result.source).toBe("walmart");
    expect(result.status).toBe("success");
    expect(result.deals.length).toBe(2);

    const tv = result.deals[0];
    expect(tv.externalId).toBe("walmart-123456");
    expect(tv.title).toBe("Samsung 65 inch 4K TV");
    expect(tv.currentPrice).toBe(499.99);
    expect(tv.originalPrice).toBe(799.99);
    expect(tv.brand).toBe("Samsung");

    const headphones = result.deals[1];
    expect(headphones.externalId).toBe("walmart-789012");
    expect(headphones.currentPrice).toBe(278);
    expect(headphones.originalPrice).toBeUndefined();
  });

  it("extracts deals from HTML item elements", async () => {
    mockGet.mockResolvedValueOnce({ data: WALMART_HTML_WITH_ITEMS });

    const result = await scrapeWalmart();

    expect(result.source).toBe("walmart");
    expect(result.deals.length).toBe(1);
    expect(result.deals[0].externalId).toBe("walmart-AAA111");
    expect(result.deals[0].currentPrice).toBe(599.99);
  });

  it("returns failed status on network error", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network timeout"));

    const result = await scrapeWalmart();

    expect(result.source).toBe("walmart");
    expect(result.status).toBe("failed");
    expect(result.deals).toHaveLength(0);
    expect(result.error).toBe("Network timeout");
  });

  it("returns partial status when no deals found", async () => {
    mockGet.mockResolvedValueOnce({ data: "<html><body></body></html>" });

    const result = await scrapeWalmart();

    expect(result.source).toBe("walmart");
    expect(result.status).toBe("partial");
    expect(result.deals).toHaveLength(0);
  });

  it("includes duration in results", async () => {
    mockGet.mockResolvedValueOnce({ data: "<html><body></body></html>" });

    const result = await scrapeWalmart();

    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration).toBe("number");
  });
});
