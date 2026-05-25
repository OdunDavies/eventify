"use server";

import { db } from "@eventtix/db";
import { auth } from "@/lib/auth";

export async function checkInTicket(qrCode: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const ticket = await db.ticket.findUnique({
    where: { qrCode },
    include: {
      ticketType: { select: { name: true, eventId: true } },
      order: { select: { eventId: true } },
    },
  });

  if (!ticket) return { success: false, message: "Ticket not found" };
  if (ticket.status === "USED") return { success: false, message: "Ticket already checked in" };
  if (ticket.status === "REFUNDED") return { success: false, message: "Ticket was refunded" };
  if (ticket.status === "CANCELLED") return { success: false, message: "Ticket was cancelled" };

  const eventId = ticket.ticketType.eventId;
  const org = await db.event.findUnique({
    where: { id: eventId },
    select: {
      organization: { select: { ownerId: true } },
    },
  });

  if (!org?.organization || org.organization.ownerId !== session.user.id) {
    return { success: false, message: "Not authorized for this event" };
  }

  await db.ticket.update({
    where: { id: ticket.id },
    data: {
      status: "USED",
      checkedInAt: new Date(),
      checkedInBy: session.user.id,
    },
  });

  return {
    success: true,
    message: "Checked in!",
    attendeeName: ticket.attendeeName,
    ticketType: ticket.ticketType.name,
  };
}
