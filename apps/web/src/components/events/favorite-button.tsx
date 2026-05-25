"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Heart } from "lucide-react";
import { cn } from "@eventtix/ui";
import { toggleFavorite } from "@/lib/actions/favorite";

interface FavoriteButtonProps {
  eventId: string;
  initialFavorited: boolean;
  count?: number;
}

export function FavoriteButton({ eventId, initialFavorited, count }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await toggleFavorite(eventId);
      setFavorited(result.favorited);
      router.refresh();
    } catch {
      signIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 text-sm transition-colors hover:scale-110"
    >
      <Heart
        className={cn(
          "h-5 w-5",
          favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
      {count !== undefined && <span className="text-muted-foreground">{count}</span>}
    </button>
  );
}
