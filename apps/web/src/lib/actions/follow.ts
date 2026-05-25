"use server";

import { db } from "@eventtix/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function toggleFollow(organizationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Sign in to follow");

  const existing = await db.organizerFollow.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId } },
  });

  if (existing) {
    await db.organizerFollow.delete({
      where: { userId_organizationId: { userId: session.user.id, organizationId } },
    });
  } else {
    await db.organizerFollow.create({
      data: { userId: session.user.id, organizationId },
    });
  }

  revalidatePath(`/dashboard`);
  return { following: !existing };
}

export async function getUserFollows(userId: string) {
  return db.organizerFollow.findMany({
    where: { userId },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, logoUrl: true, _count: { select: { events: true } } },
      },
    },
    orderBy: { organization: { name: "asc" } },
  });
}
