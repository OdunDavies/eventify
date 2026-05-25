"use server";

import { db } from "@eventtix/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

const discountSchema = z.object({
  eventId: z.string(),
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  valueKobo: z.coerce.number().optional(),
  percentage: z.coerce.number().min(1).max(100).optional(),
  maxUsage: z.coerce.number().min(1).optional(),
  minCartAmount: z.coerce.number().optional(),
  expiresAt: z.string().optional(),
});

export async function createDiscountCode(data: z.infer<typeof discountSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const event = await db.event.findFirst({
    where: { id: data.eventId, organization: { ownerId: session.user.id } },
  });
  if (!event) throw new Error("Event not found");

  const parsed = discountSchema.parse(data);

  await db.discountCode.create({
    data: {
      eventId: parsed.eventId,
      code: parsed.code,
      type: parsed.type,
      valueKobo: parsed.valueKobo,
      percentage: parsed.percentage,
      maxUsage: parsed.maxUsage,
      minCartAmount: parsed.minCartAmount,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    },
  });

  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function deleteDiscountCode(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const code = await db.discountCode.findFirst({
    where: { id, event: { organization: { ownerId: session.user.id } } },
  });
  if (!code) throw new Error("Not found");

  await db.discountCode.delete({ where: { id } });
  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function validateDiscountCode(code: string, eventId: string, cartKobo: number) {
  const discount = await db.discountCode.findUnique({
    where: { eventId_code: { eventId, code: code.toUpperCase() } },
  });

  if (!discount) return { valid: false, message: "Invalid code" };
  if (discount.maxUsage && discount.currentUsage >= discount.maxUsage) {
    return { valid: false, message: "Code fully used" };
  }
  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return { valid: false, message: "Code expired" };
  }
  if (discount.minCartAmount && cartKobo < discount.minCartAmount) {
    return { valid: false, message: `Min cart: ₦${(discount.minCartAmount / 100).toLocaleString()}` };
  }

  let discountKobo = 0;
  if (discount.type === "FIXED") {
    discountKobo = Math.min(discount.valueKobo ?? 0, cartKobo);
  } else {
    discountKobo = Math.round(cartKobo * ((discount.percentage ?? 0) / 100));
  }

  return { valid: true, discountKobo, type: discount.type, message: `-₦${(discountKobo / 100).toLocaleString()}` };
}
