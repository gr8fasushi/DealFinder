import axios from "axios";
import { z } from "zod";

// Zod schemas for validation
const YouTubeVideoSnippet = z.object({
  title: z.string(),
  description: z.string(),
  thumbnails: z.object({
    high: z.object({
      url: z.string(),
    }),
    medium: z.object({
      url: z.string(),
    }),
  }),
  channelTitle: z.string(),
  publishedAt: z.string(),
});

const YouTubeSearchItem = z.object({
  id: z.object({
    videoId: z.string(),
  }),
  snippet: YouTubeVideoSnippet,
});

const YouTubeSearchResponse = z.object({
  items: z.array(YouTubeSearchItem),
});

const YouTubeVideoStatistics = z.object({
  viewCount: z.string(),
});

const YouTubeVideoItem = z.object({
  id: z.string(),
  statistics: YouTubeVideoStatistics,
});

const YouTubeVideosResponse = z.object({
  items: z.array(YouTubeVideoItem),
});

// Internal video metadata type
export interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: Date;
  viewCount: number;
}

// YouTube API configuration
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Quota tracking (in-memory, resets on server restart)
let dailyQuotaUsed = 0;
const DAILY_QUOTA_LIMIT = 10000; // Conservative limit (actual is 15,000)
const SEARCH_QUOTA_COST = 100;

/**
 * Build an optimized search query for YouTube
 * Combines deal title, brand, and "review" keyword
 * Removes common noise words
 */
export function buildSearchQuery(dealTitle: string, brand?: string): string {
  // Remove noise words commonly found in deal titles
  const noiseWords = [
    "deal",
    "off",
    "discount",
    "sale",
    "save",
    "special",
    "offer",
    "promo",
  ];

  let query = dealTitle;

  // Remove noise words (case insensitive)
  noiseWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    query = query.replace(regex, "");
  });

  // Add brand if available
  if (brand) {
    query = `${brand} ${query}`;
  }

  // Add "review" keyword
  query = `${query.trim()} review`;

  // Clean up extra spaces
  query = query.replace(/\s+/g, " ").trim();

  return query;
}

/**
 * Search for YouTube videos using the YouTube Data API v3
 * Implements quota protection and error handling
 *
 * @param query - Search query string
 * @param maxResults - Maximum number of results (default: 5)
 * @returns Array of video metadata
 */
export async function searchVideos(
  query: string,
  maxResults: number = 5
): Promise<VideoMetadata[]> {
  // Check if API key is configured
  if (!YOUTUBE_API_KEY) {
    console.warn(
      "YouTube API key not configured. Skipping video search."
    );
    return [];
  }

  // Check quota limit
  if (dailyQuotaUsed + SEARCH_QUOTA_COST > DAILY_QUOTA_LIMIT) {
    console.warn(
      `YouTube API quota limit approaching (${dailyQuotaUsed}/${DAILY_QUOTA_LIMIT}). Skipping search.`
    );
    return [];
  }

  try {
    // Step 1: Search for videos
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults,
        order: "relevance",
        relevanceLanguage: "en",
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    // Validate response
    const validatedSearch = YouTubeSearchResponse.parse(searchResponse.data);

    if (validatedSearch.items.length === 0) {
      console.log(`No YouTube videos found for query: ${query}`);
      return [];
    }

    // Extract video IDs
    const videoIds = validatedSearch.items.map((item) => item.id.videoId);

    // Step 2: Get video statistics (view counts)
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: "statistics",
        id: videoIds.join(","),
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    // Validate statistics response
    const validatedVideos = YouTubeVideosResponse.parse(videosResponse.data);

    // Step 3: Combine search results with statistics
    const videos: VideoMetadata[] = validatedSearch.items.map((item) => {
      const stats = validatedVideos.items.find(
        (v) => v.id === item.id.videoId
      );
      const viewCount = stats ? parseInt(stats.statistics.viewCount, 10) : 0;

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: new Date(item.snippet.publishedAt),
        viewCount,
      };
    });

    // Update quota usage
    dailyQuotaUsed += SEARCH_QUOTA_COST;
    console.log(
      `YouTube API search successful. Quota used: ${dailyQuotaUsed}/${DAILY_QUOTA_LIMIT}`
    );

    return videos;
  } catch (error) {
    // Handle different error types
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.error(
          "YouTube API quota exceeded or access forbidden:",
          error.response.data
        );
      } else if (error.response?.status === 400) {
        console.error("YouTube API bad request:", error.response.data);
      } else if (error.code === "ECONNABORTED") {
        console.error("YouTube API request timeout");
      } else {
        console.error("YouTube API network error:", error.message);
      }
    } else if (error instanceof z.ZodError) {
      console.error("YouTube API response validation error:", error.errors);
    } else {
      console.error("Unexpected error during YouTube search:", error);
    }

    // Return empty array on error (graceful degradation)
    return [];
  }
}

/**
 * Reset daily quota counter (can be called via cron at midnight)
 */
export function resetDailyQuota(): void {
  dailyQuotaUsed = 0;
  console.log("YouTube API daily quota counter reset");
}

/**
 * Get current quota usage statistics
 */
export function getQuotaStats(): { used: number; limit: number; remaining: number } {
  return {
    used: dailyQuotaUsed,
    limit: DAILY_QUOTA_LIMIT,
    remaining: DAILY_QUOTA_LIMIT - dailyQuotaUsed,
  };
}
