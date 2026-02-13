const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function parsePrice(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9.]/g, "");
  const price = parseFloat(cleaned);
  if (isNaN(price) || price <= 0) return null;
  return Math.round(price * 100) / 100;
}

export function calculateSavings(
  currentPrice: number,
  originalPrice?: number
): { savingsAmount: number; savingsPercent: number } | null {
  if (!originalPrice || originalPrice <= currentPrice) return null;
  const savingsAmount = Math.round((originalPrice - currentPrice) * 100) / 100;
  const savingsPercent =
    Math.round((savingsAmount / originalPrice) * 10000) / 100;
  return { savingsAmount, savingsPercent };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(minMs: number = 1000, maxMs: number = 2000): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return delay(ms);
}

export function sanitizeUrl(url: string, baseUrl: string): string {
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
