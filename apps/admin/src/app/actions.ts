"use server";

import { db } from "@eventtix/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function adminApprovePayout(payoutId: string) {
  await requireAdmin();
  await db.payout.update({
    where: { id: payoutId },
    data: { status: "SUCCESS", paidAt: new Date() },
  });
  revalidatePath("/payouts");
}

export async function adminRejectPayout(payoutId: string) {
  await requireAdmin();
  await db.payout.update({
    where: { id: payoutId },
    data: { status: "FAILED" },
  });
  revalidatePath("/payouts");
}
