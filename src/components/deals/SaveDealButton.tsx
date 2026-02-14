"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface SaveDealButtonProps {
  dealId: number;
  initialIsSaved: boolean;
}

export function SaveDealButton({
  dealId,
  initialIsSaved,
}: SaveDealButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Don't render button if user is not signed in
  if (!isSignedIn) {
    return null;
  }

  const handleSaveToggle = async () => {
    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/deals/saved/${dealId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsSaved(false);
          router.refresh(); // Refresh server components
        } else {
          console.error("Failed to unsave deal");
        }
      } else {
        // Save
        const response = await fetch("/api/deals/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId }),
        });

        if (response.ok) {
          setIsSaved(true);
          router.refresh(); // Refresh server components
        } else {
          console.error("Failed to save deal");
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="lg"
      className="w-full text-lg py-6"
      onClick={handleSaveToggle}
      disabled={isLoading}
    >
      <Heart className={`w-5 h-5 mr-2 ${isSaved ? "fill-current" : ""}`} />
      {isSaved ? "Saved" : "Save Deal"}
    </Button>
  );
}
