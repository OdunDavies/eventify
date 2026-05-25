"use server";

import { db } from "@eventtix/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function toggleFavorite(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Sign in to favorite");

  const existing = await db.eventFavorite.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  });

  if (existing) {
    await db.eventFavorite.delete({
      where: { userId_eventId: { userId: session.user.id, eventId } },
    });
  } else {
    await db.eventFavorite.create({
      data: { userId: session.user.id, eventId },
    });
  }

  revalidatePath(`/events`);
  return { favorited: !existing };
}

export async function getUserFavorites(userId: string) {
  return db.eventFavorite.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          coverImage: true,
          city: true,
          category: true,
          isFree: true,
          ticketTypes: { select: { priceKobo: true }, orderBy: { priceKobo: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { event: { startDate: "asc" } },
  });
}
