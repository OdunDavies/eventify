"use server";

import { db } from "@eventtix/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOrganizerToken } from "../session";
import { uniqueSlug } from "../slug";

const basicInfoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDesc: z.string().optional(),
  category: z.string().default("OTHER"),
  eventType: z.string().default("PHYSICAL"),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
});

const dateTimeSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  doorTime: z.string().optional(),
  timezone: z.string().default("Africa/Lagos"),
});

const locationSchema = z.object({
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  meetingLink: z.string().optional(),
});

const ticketTypeSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  description: z.string().optional(),
  priceKobo: z.coerce.number().min(0),
  quantity: z.coerce.number().min(1, "Must have at least 1 ticket"),
  maxPerOrder: z.coerce.number().min(1).default(10),
});

export async function createOrUpdateEvent(data: {
  step: number;
  eventId?: string;
  basicInfo?: z.infer<typeof basicInfoSchema>;
  dateTime?: z.infer<typeof dateTimeSchema>;
  location?: z.infer<typeof locationSchema>;
  ticketTypes?: z.infer<typeof ticketTypeSchema>[];
}) {
  const token = requireOrganizerToken();

  if (data.step === 1 && data.basicInfo) {
    const parsed = basicInfoSchema.parse(data.basicInfo);
    const slug = await uniqueSlug(db, parsed.title);

    const event = await db.event.upsert({
      where: { id: data.eventId ?? "" },
      create: {
        title: parsed.title,
        slug,
        description: parsed.description,
        shortDesc: parsed.shortDesc,
        coverImage: parsed.coverImage ?? null,
        gallery: parsed.gallery ?? [],
        videoUrl: parsed.videoUrl ?? null,
        category: parsed.category as any,
        eventType: parsed.eventType as any,
        organizerToken: token,
        startDate: new Date(),
        endDate: new Date(),
      },
      update: {
        title: parsed.title,
        description: parsed.description,
        shortDesc: parsed.shortDesc,
        coverImage: parsed.coverImage ?? null,
        gallery: parsed.gallery ?? [],
        videoUrl: parsed.videoUrl ?? null,
        category: parsed.category as any,
        eventType: parsed.eventType as any,
      },
    });

    revalidatePath("/events/new");
    return { eventId: event.id, slug: event.slug };
  }

  if (data.step === 2 && data.eventId && data.dateTime) {
    const parsed = dateTimeSchema.parse(data.dateTime);
    const event = await db.event.update({
      where: { id: data.eventId },
      data: {
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        doorTime: parsed.doorTime ? new Date(parsed.doorTime) : null,
        timezone: parsed.timezone,
      },
    });
    revalidatePath("/events/new");
    return { eventId: event.id };
  }

  if (data.step === 3 && data.eventId && data.location) {
    const parsed = locationSchema.parse(data.location);
    const event = await db.event.update({
      where: { id: data.eventId },
      data: {
        venueName: parsed.venueName,
        venueAddress: parsed.venueAddress,
        city: parsed.city,
        state: parsed.state,
        meetingLink: parsed.meetingLink,
      },
    });
    revalidatePath("/events/new");
    return { eventId: event.id };
  }

  if (data.step === 4 && data.eventId && data.ticketTypes) {
    const parsed = ticketTypeSchema.array().parse(data.ticketTypes);
    await db.ticketType.deleteMany({ where: { eventId: data.eventId } });
    await db.ticketType.createMany({
      data: parsed.map((t) => ({
        eventId: data.eventId!,
        name: t.name,
        description: t.description,
        priceKobo: t.priceKobo,
        quantity: t.quantity,
        maxPerOrder: t.maxPerOrder,
      })),
    });
    revalidatePath("/events/new");
    return { eventId: data.eventId };
  }

  throw new Error("Invalid step data");
}

export async function publishEvent(eventId: string, email: string) {
  const token = requireOrganizerToken();
  const event = await db.event.findFirst({
    where: { id: eventId, organizerToken: token },
    include: { ticketTypes: true },
  });

  if (!event) throw new Error("Event not found");
  if (event.ticketTypes.length === 0) throw new Error("Add at least one ticket type");

  const isFree = event.ticketTypes.every((t) => t.priceKobo === 0);

  await db.event.update({
    where: { id: eventId },
    data: {
      status: "PUBLISHED",
      isFree,
      contactEmail: email,
    },
  });

  revalidatePath(`/events/${event.slug}`);
  return { slug: event.slug };
}

export async function getEventForEdit(eventId: string) {
  const token = requireOrganizerToken();
  return db.event.findFirst({
    where: { id: eventId, organizerToken: token },
    include: { ticketTypes: { orderBy: { sortOrder: "asc" } } },
  });
}
