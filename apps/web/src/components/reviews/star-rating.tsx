"use client";

import { cn } from "@eventtix/ui";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}

export function StarRating({
  value,
  onChange,
  interactive = false,
  size = "sm",
}: StarRatingProps) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : "button"}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110",
            !interactive && "cursor-default"
          )}
        >
          <Star
            className={cn(
              starSize,
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
