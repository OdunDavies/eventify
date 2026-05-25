"use server";

import { db } from "@eventtix/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

const reviewSchema = z.object({
  eventId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
});

export async function createReview(data: z.infer<typeof reviewSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Sign in to leave a review");

  const parsed = reviewSchema.parse(data);

  const existing = await db.review.findUnique({
    where: { eventId_userId: { eventId: parsed.eventId, userId: session.user.id } },
  });

  if (existing) throw new Error("You already reviewed this event");

  const event = await db.event.findUnique({
    where: { id: parsed.eventId },
    select: { slug: true },
  });

  if (!event) throw new Error("Event not found");

  await db.review.create({
    data: {
      eventId: parsed.eventId,
      userId: session.user.id,
      rating: parsed.rating,
      comment: parsed.comment,
    },
  });

  revalidatePath(`/events/${event.slug}`);
  return { success: true };
}
