"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VideoPlayerModalProps {
  video: {
    videoId: string;
    title: string;
    channelTitle: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayerModal({
  video,
  isOpen,
  onClose,
}: VideoPlayerModalProps) {
  // Construct YouTube embed URL with recommended parameters
  const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">{video.title}</DialogTitle>
          <DialogDescription className="text-sm">
            by {video.channelTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Video Player */}
        <div className="aspect-video w-full px-6 pb-6">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
