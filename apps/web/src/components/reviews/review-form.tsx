"use client";

import { useState } from "react";
import { Button, Textarea } from "@eventtix/ui";
import { StarRating } from "./star-rating";
import { createReview } from "@/lib/actions/review";

interface ReviewFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ eventId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Select a rating");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await createReview({ eventId, rating, comment });
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-medium">Rating</p>
        <StarRating value={rating} onChange={setRating} interactive size="md" />
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={submitting || !rating || !comment}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
