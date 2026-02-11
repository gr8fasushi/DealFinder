import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deals, youtubeVideos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { searchVideos, buildSearchQuery } from "@/lib/services/youtube";

// Cache freshness threshold (30 days in milliseconds)
const CACHE_FRESHNESS_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });
    }

    // Step 1: Check if deal exists
    const deal = await db.query.deals.findFirst({
      where: and(eq(deals.id, dealId), eq(deals.isActive, true)),
      with: {
        store: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Step 2: Check for existing cached videos
    const cachedVideos = await db.query.youtubeVideos.findMany({
      where: eq(youtubeVideos.dealId, dealId),
      orderBy: (videos, { desc }) => [desc(videos.viewCount)],
    });

    // Step 3: Check if cache is fresh (< 30 days old)
    const cacheIsFresh =
      cachedVideos.length > 0 &&
      cachedVideos[0].createdAt &&
      Date.now() - new Date(cachedVideos[0].createdAt).getTime() <
        CACHE_FRESHNESS_MS;

    // Step 4: If cache is fresh, return cached videos
    if (cacheIsFresh) {
      const formattedVideos = cachedVideos.map((video) => ({
        id: video.id,
        videoId: video.videoId,
        title: video.title || "",
        description: video.description || "",
        thumbnailUrl: video.thumbnailUrl || "",
        channelTitle: video.channelTitle || "",
        publishedAt: video.publishedAt?.toISOString() || "",
        viewCount: video.viewCount || 0,
        embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
      }));

      return NextResponse.json({
        videos: formattedVideos,
        cached: true,
        fetchedAt: cachedVideos[0].createdAt?.toISOString() || new Date().toISOString(),
      });
    }

    // Step 5: Cache is stale or missing, fetch from YouTube API
    const searchQuery = buildSearchQuery(deal.title, deal.brand || undefined);
    console.log(`Fetching YouTube videos for deal ${dealId}: "${searchQuery}"`);

    const videoMetadata = await searchVideos(searchQuery, 5);

    // Step 6: If YouTube API returned no results, return empty array
    if (videoMetadata.length === 0) {
      console.log(`No YouTube videos found for deal ${dealId}`);
      return NextResponse.json({
        videos: [],
        cached: false,
        fetchedAt: new Date().toISOString(),
        message: "No review videos found for this product",
      });
    }

    // Step 7: Delete old cached videos for this deal
    if (cachedVideos.length > 0) {
      await db
        .delete(youtubeVideos)
        .where(eq(youtubeVideos.dealId, dealId));
      console.log(`Deleted ${cachedVideos.length} stale videos for deal ${dealId}`);
    }

    // Step 8: Insert new videos into database
    const videoRecords = videoMetadata.map((video) => ({
      dealId,
      videoId: video.videoId,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      viewCount: video.viewCount,
    }));

    await db.insert(youtubeVideos).values(videoRecords);
    console.log(`Inserted ${videoRecords.length} new videos for deal ${dealId}`);

    // Step 9: Fetch the newly inserted videos (with auto-generated IDs)
    const newVideos = await db.query.youtubeVideos.findMany({
      where: eq(youtubeVideos.dealId, dealId),
      orderBy: (videos, { desc }) => [desc(videos.viewCount)],
    });

    // Step 10: Format and return response
    const formattedVideos = newVideos.map((video) => ({
      id: video.id,
      videoId: video.videoId,
      title: video.title || "",
      description: video.description || "",
      thumbnailUrl: video.thumbnailUrl || "",
      channelTitle: video.channelTitle || "",
      publishedAt: video.publishedAt?.toISOString() || "",
      viewCount: video.viewCount || 0,
      embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
    }));

    return NextResponse.json({
      videos: formattedVideos,
      cached: false,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);

    // Return empty videos array with error flag (don't break the page)
    return NextResponse.json(
      {
        videos: [],
        cached: false,
        fetchedAt: new Date().toISOString(),
        error: "Failed to fetch videos",
      },
      { status: 500 }
    );
  }
}
