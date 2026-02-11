"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VideoCardProps {
  video: {
    videoId: string;
    title: string;
    thumbnailUrl: string;
    channelTitle: string;
    viewCount: number;
    publishedAt: string;
  };
  onClick: () => void;
}

/**
 * Format view count to human-readable format
 * Examples: 1234 -> "1.2K", 1234567 -> "1.2M"
 */
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
}

/**
 * Format published date to relative time
 * Example: "2 months ago", "3 weeks ago"
 */
function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "";
  }
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
      onClick={onClick}
    >
      {/* Thumbnail with Play Button Overlay */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-900">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          unoptimized
          className="object-cover"
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Video Info */}
      <CardContent className="p-3">
        {/* Title - clamped to 2 lines */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        {/* Channel Name */}
        <p className="text-xs text-muted-foreground mb-1">
          {video.channelTitle}
        </p>

        {/* Stats Row: Views & Published Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatViewCount(video.viewCount)}</span>
          <span>•</span>
          <span>{formatRelativeDate(video.publishedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
