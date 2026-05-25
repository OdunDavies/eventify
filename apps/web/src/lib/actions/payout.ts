"use server";

import { db } from "@eventtix/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function requestPayout(organizationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const org = await db.organization.findFirst({
    where: { id: organizationId, ownerId: session.user.id },
    include: { _count: { select: { payouts: true } } },
  });
  if (!org) throw new Error("Organization not found");

  const pendingPayout = await db.payout.findFirst({
    where: { organizationId, status: { in: ["PENDING", "PROCESSING"] } },
  });
  if (pendingPayout) throw new Error("You already have a pending payout request");

  const events = await db.event.findMany({
    where: { organizationId, status: "COMPLETED" },
    select: { revenueKobo: true },
  });
  const totalRevenue = events.reduce((s, e) => s + e.revenueKobo, 0);

  const paidPayouts = await db.payout.findMany({
    where: { organizationId, status: "SUCCESS" },
    select: { netAmountKobo: true },
  });
  const totalPaid = paidPayouts.reduce((s, p) => s + p.netAmountKobo, 0);

  const availableKobo = totalRevenue - totalPaid;
  if (availableKobo <= 0) throw new Error("No available balance to withdraw");

  const feeKobo = Math.round(availableKobo * 0.02);
  const netKobo = availableKobo - feeKobo;

  const ref = `PO-${Date.now().toString(36).toUpperCase()}`;

  await db.payout.create({
    data: {
      organizationId,
      amountKobo: availableKobo,
      feeKobo,
      netAmountKobo: netKobo,
      bankName: org.bankAccountName ?? "Pending",
      bankAccount: org.bankAccountNumber ?? "Pending",
      accountName: org.bankAccountName ?? "Pending",
      reference: ref,
    },
  });

  revalidatePath(`/dashboard/payouts`);
  return { success: true, reference: ref };
}

export async function getPayoutHistory(organizationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.payout.findMany({
    where: { organizationId, organization: { ownerId: session.user.id } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBalance(organizationId: string) {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const org = await db.organization.findFirst({
    where: { id: organizationId, ownerId: session.user.id },
  });
  if (!org) return 0;

  const events = await db.event.findMany({
    where: { organizationId, status: "COMPLETED" },
    select: { revenueKobo: true },
  });
  const totalRevenue = events.reduce((s, e) => s + e.revenueKobo, 0);

  const paidPayouts = await db.payout.findMany({
    where: { organizationId, status: "SUCCESS" },
    select: { netAmountKobo: true },
  });
  const totalPaid = paidPayouts.reduce((s, p) => s + p.netAmountKobo, 0);

  return totalRevenue - totalPaid;
}
