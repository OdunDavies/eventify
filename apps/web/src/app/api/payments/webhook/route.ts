import { NextRequest, NextResponse } from "next/server";
import { db } from "@eventtix/db";
import { sendEmail } from "@eventtix/email";
import { TicketConfirmationEmail } from "@eventtix/email/templates";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const expectedSig = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference;
    const email = data.customer?.email;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { orderNumber: reference },
      include: {
        tickets: true,
        event: true,
      },
    });

    if (order && order.paymentStatus !== "SUCCESS") {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "SUCCESS",
          paidAt: new Date(),
        },
      });

      await db.event.update({
        where: { id: order.eventId },
        data: {
          ticketSold: { increment: order.tickets.length },
          revenueKobo: { increment: order.totalKobo },
        },
      });

      if (email) {
        const eventDate = order.event.startDate.toLocaleDateString("en-NG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        await sendEmail({
          to: email,
          subject: `Your tickets for ${order.event.title} are confirmed!`,
          react: TicketConfirmationEmail({
            attendeeName: order.userName ?? email,
            eventTitle: order.event.title,
            eventDate,
            eventVenue:
              order.event.venueName ?? order.event.city ?? "Online Event",
            orderNumber: order.orderNumber,
            ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/orders/${order.orderNumber}`,
          }),
        });
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}
