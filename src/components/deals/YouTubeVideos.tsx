"use client";

import { useState, useEffect } from "react";
import { VideoCard } from "./VideoCard";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export interface VideoData {
  id: number;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  embedUrl: string;
}

interface YouTubeVideosProps {
  dealId: number;
  initialVideos?: VideoData[];
}

export function YouTubeVideos({ dealId, initialVideos }: YouTubeVideosProps) {
  const [videos, setVideos] = useState<VideoData[]>(initialVideos || []);
  const [isLoading, setIsLoading] = useState(!initialVideos);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    if (!initialVideos) {
      fetchVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId, initialVideos]);

  async function fetchVideos() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/deals/${dealId}/youtube`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch videos");
      }

      setVideos(data.videos || []);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load review videos"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-x-visible">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-80 md:w-auto">
              <Skeleton className="aspect-video w-full rounded-lg mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
          Videos Unavailable
        </h3>
        <p className="text-amber-700 dark:text-amber-300">
          {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-lg text-muted-foreground mb-2">
          No review videos found for this product
        </p>
        <p className="text-sm text-muted-foreground">
          Check back later for product reviews and demonstrations
        </p>
      </div>
    );
  }

  // Success state - display videos
  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex-shrink-0 w-80 md:w-auto"
          >
            <VideoCard
              video={video}
              onClick={() => setSelectedVideo(video)}
            />
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
