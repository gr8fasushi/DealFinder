export interface ScrapedDeal {
  externalId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  currentPrice: number;
  originalPrice?: number;
  productUrl: string;
  sku?: string;
  brand?: string;
  categoryHint?: string;
}

export interface ScraperResult {
  source: string;
  status: "success" | "failed" | "partial";
  deals: ScrapedDeal[];
  error?: string;
  duration: number;
}

export interface ScraperConfig {
  source: string;
  storeId: number;
  enabled: boolean;
}

export interface CoordinatorResult {
  results: ScraperResult[];
  totalFound: number;
  totalAdded: number;
  totalUpdated: number;
  totalExpired: number;
}
