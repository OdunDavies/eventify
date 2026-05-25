"use server";

import { db } from "@eventtix/db";
import { createPaymentProvider } from "@eventtix/payment";
import { revalidatePath } from "next/cache";

export async function initializeCheckout(params: {
  eventSlug: string;
  ticketTypeId: string;
  quantity: number;
}) {
  const event = await db.event.findUnique({
    where: { slug: params.eventSlug },
    include: { ticketTypes: true },
  });

  if (!event || event.status !== "PUBLISHED") {
    throw new Error("Event not found or not available");
  }

  const ticketType = event.ticketTypes.find(
    (t) => t.id === params.ticketTypeId
  );
  if (!ticketType) throw new Error("Ticket type not found");

  if (params.quantity > ticketType.maxPerOrder) {
    throw new Error(
      `Max ${ticketType.maxPerOrder} tickets per order`
    );
  }

  const totalKobo = ticketType.priceKobo * params.quantity;
  const serviceFeeKobo = totalKobo > 0 ? Math.round(totalKobo * 0.05) : 0;
  const grandTotal = totalKobo + serviceFeeKobo;

  return {
    event: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      isFree: event.isFree,
    },
    ticketType: {
      id: ticketType.id,
      name: ticketType.name,
      priceKobo: ticketType.priceKobo,
      quantity: params.quantity,
      maxPerOrder: ticketType.maxPerOrder,
    },
    totalKobo,
    serviceFeeKobo,
    grandTotal,
    currency: "NGN",
  };
}

export async function createOrder(params: {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  email: string;
  name: string;
  phone: string;
}) {
  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: { ticketTypes: true },
  });
  if (!event || event.status !== "PUBLISHED") {
    throw new Error("Event not found");
  }

  const ticketType = event.ticketTypes.find(
    (t) => t.id === params.ticketTypeId
  );
  if (!ticketType) throw new Error("Ticket type not found");

  const totalKobo = ticketType.priceKobo * params.quantity;
  const serviceFeeKobo = totalKobo > 0 ? Math.round(totalKobo * 0.05) : 0;
  const grandTotal = totalKobo + serviceFeeKobo;

  const orderNumber = `TIX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const order = await db.order.create({
    data: {
      orderNumber,
      userEmail: params.email,
      userName: params.name,
      userPhone: params.phone,
      eventId: params.eventId,
      subtotalKobo: totalKobo,
      serviceFeeKobo,
      totalKobo: grandTotal,
      currency: "NGN",
      paymentProvider: event.isFree ? "free" : "paystack",
      paymentStatus: event.isFree ? "SUCCESS" : "PENDING",
      paidAt: event.isFree ? new Date() : null,
      tickets: {
        create: Array.from({ length: params.quantity }, (_, i) => ({
          ticketTypeId: params.ticketTypeId,
          attendeeName: params.name,
          attendeeEmail: params.email,
          attendeePhone: params.phone,
          qrCode: `${orderNumber}-${i + 1}-${crypto.randomUUID().slice(0, 8)}`,
        })),
      },
    },
    include: { tickets: true },
  });

  if (event.isFree) {
    await db.event.update({
      where: { id: event.id },
      data: { ticketSold: { increment: params.quantity } },
    });
  }

  revalidatePath(`/events/${event.slug}`);

  if (event.isFree) {
    return { order, requiresPayment: false };
  }

  const provider = createPaymentProvider("paystack");
  const payment = await provider.initializePayment({
    email: params.email,
    amountKobo: grandTotal,
    reference: orderNumber,
    metadata: {
      orderId: order.id,
      eventTitle: event.title,
    },
  });

  await db.order.update({
    where: { id: order.id },
    data: { paymentRef: payment.reference },
  });

  return {
    order,
    requiresPayment: true,
    paymentUrl: payment.authorizationUrl,
    accessCode: payment.accessCode,
  };
}

export async function verifyPayment(orderNumber: string) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { tickets: true, event: true },
  });
  if (!order) throw new Error("Order not found");

  if (order.paymentProvider === "free") return order;

  const provider = createPaymentProvider("paystack");
  const result = await provider.verifyPayment({ reference: orderNumber });

  if (result.status === "success") {
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "SUCCESS",
        paidAt: result.paidAt ? new Date(result.paidAt) : new Date(),
      },
    });
    await db.event.update({
      where: { id: order.eventId },
      data: {
        ticketSold: { increment: order.tickets?.length ?? 0 },
        revenueKobo: { increment: order.totalKobo },
      },
    });
  } else if (result.status === "failed") {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });
  }

  return db.order.findUnique({
    where: { orderNumber },
    include: { tickets: true, event: true },
  });
}
