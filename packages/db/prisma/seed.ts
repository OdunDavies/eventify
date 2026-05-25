import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const admin = await db.user.upsert({
    where: { email: "admin@eventtix.com" },
    update: {},
    create: {
      email: "admin@eventtix.com",
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("  Admin user:", admin.email);

  const orgUser = await db.user.upsert({
    where: { email: "organizer@eventtix.com" },
    update: {},
    create: {
      email: "organizer@eventtix.com",
      name: "Jane Organizer",
      role: "ORGANIZER",
      emailVerified: new Date(),
    },
  });
  console.log("  Organizer user:", orgUser.email);

  const attendee = await db.user.upsert({
    where: { email: "attendee@eventtix.com" },
    update: {},
    create: {
      email: "attendee@eventtix.com",
      name: "John Attendee",
      role: "ATTENDEE",
      emailVerified: new Date(),
    },
  });
  console.log("  Attendee user:", attendee.email);

  const org = await db.organization.upsert({
    where: { slug: "eventtix-demo" },
    update: {},
    create: {
      name: "EventTix Demo Org",
      slug: "eventtix-demo",
      description: "Demo organization for testing",
      ownerId: orgUser.id,
      bankAccountName: "Jane Organizer",
      bankAccountNumber: "0123456789",
      bankName: "GTBank",
    },
  });
  console.log("  Organization:", org.name);

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  const dayAfter = new Date(nextMonth.getTime() + 86400000);

  const techEvent = await db.event.upsert({
    where: { slug: "lagos-tech-meetup-2025" },
    update: {},
    create: {
      title: "Lagos Tech Meetup 2025",
      slug: "lagos-tech-meetup-2025",
      description: "A meetup for tech enthusiasts in Lagos. Network, learn, and share ideas about the latest in technology.",
      shortDesc: "Network with Lagos tech enthusiasts",
      category: "TECH",
      eventType: "PHYSICAL",
      startDate: nextMonth,
      endDate: dayAfter,
      venueName: "Landmark Centre",
      venueAddress: "Plot 2-4, Water Corporation Road",
      city: "Victoria Island",
      state: "Lagos",
      isFree: false,
      capacity: 500,
      status: "PUBLISHED",
      organizationId: org.id,
      contactEmail: orgUser.email,
    },
  });

  await db.ticketType.upsert({
    where: { id: `${techEvent.id}-general` },
    update: { priceKobo: 500000 },
    create: {
      id: `${techEvent.id}-general`,
      eventId: techEvent.id,
      name: "General Admission",
      description: "Standard entry",
      priceKobo: 500000,
      quantity: 400,
      maxPerOrder: 5,
      sortOrder: 1,
    },
  });

  await db.ticketType.upsert({
    where: { id: `${techEvent.id}-vip` },
    update: { priceKobo: 1500000 },
    create: {
      id: `${techEvent.id}-vip`,
      eventId: techEvent.id,
      name: "VIP",
      description: "Front row seating + welcome drink",
      priceKobo: 1500000,
      quantity: 100,
      maxPerOrder: 2,
      sortOrder: 2,
    },
  });

  await db.discountCode.upsert({
    where: { eventId_code: { eventId: techEvent.id, code: "EARLY20" } },
    update: {},
    create: {
      eventId: techEvent.id,
      code: "EARLY20",
      type: "PERCENTAGE",
      percentage: 20,
      maxUsage: 50,
    },
  });

  const musicEvent = await db.event.upsert({
    where: { slug: "afrobeat-festival-2025" },
    update: {},
    create: {
      title: "Afrobeat Festival 2025",
      slug: "afrobeat-festival-2025",
      description: "The biggest Afrobeat festival in West Africa. Featuring top artists, food vendors, and cultural displays.",
      shortDesc: "West Africa's biggest Afrobeat festival",
      category: "MUSIC",
      eventType: "PHYSICAL",
      startDate: new Date(nextMonth.getTime() + 14 * 86400000),
      endDate: new Date(nextMonth.getTime() + 16 * 86400000),
      venueName: "TBS Lagos",
      venueAddress: "Tafawa Balewa Square",
      city: "Lagos Island",
      state: "Lagos",
      isFree: false,
      capacity: 5000,
      status: "PUBLISHED",
      organizationId: org.id,
      contactEmail: orgUser.email,
    },
  });

  await db.ticketType.upsert({
    where: { id: `${musicEvent.id}-regular` },
    update: { priceKobo: 1000000 },
    create: {
      id: `${musicEvent.id}-regular`,
      eventId: musicEvent.id,
      name: "Regular",
      description: "3-day pass",
      priceKobo: 1000000,
      quantity: 4000,
      maxPerOrder: 10,
      sortOrder: 1,
    },
  });

  await db.event.upsert({
    where: { slug: "online-coding-workshop" },
    update: {},
    create: {
      title: "Online Coding Workshop",
      slug: "online-coding-workshop",
      description: "Learn full-stack development in this free online workshop. Perfect for beginners.",
      shortDesc: "Free full-stack coding workshop",
      category: "TECH",
      eventType: "VIRTUAL",
      startDate: new Date(nextMonth.getTime() + 7 * 86400000),
      endDate: new Date(nextMonth.getTime() + 7 * 86400000 + 3 * 3600000),
      meetingLink: "https://meet.google.com/abc-defg-hij",
      isFree: true,
      capacity: 200,
      status: "PUBLISHED",
      organizationId: org.id,
      contactEmail: orgUser.email,
    },
  });

  await db.event.upsert({
    where: { slug: "abuja-food-fair" },
    update: {},
    create: {
      title: "Abuja Food Fair",
      slug: "abuja-food-fair",
      description: "Taste delicacies from across Nigeria at the Abuja Food Fair. Live cooking demonstrations and more.",
      shortDesc: "Nigeria's finest cuisine in Abuja",
      category: "FOOD",
      eventType: "PHYSICAL",
      startDate: new Date(nextMonth.getTime() + 21 * 86400000),
      endDate: new Date(nextMonth.getTime() + 22 * 86400000),
      venueName: "International Conference Centre",
      venueAddress: "Abuja",
      city: "Abuja",
      state: "FCT",
      isFree: true,
      status: "PUBLISHED",
      organizationId: org.id,
      contactEmail: orgUser.email,
    },
  });

  console.log("  Events created");

  const order = await db.order.create({
    data: {
      orderNumber: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      userId: attendee.id,
      userEmail: attendee.email,
      userName: attendee.name,
      eventId: techEvent.id,
      subtotalKobo: 500000,
      serviceFeeKobo: 25000,
      totalKobo: 525000,
      paymentStatus: "SUCCESS",
      paidAt: new Date(),
    },
  });

  await db.ticket.create({
    data: {
      orderId: order.id,
      eventId: techEvent.id,
      ticketTypeId: `${techEvent.id}-general`,
      name: attendee.name!,
      email: attendee.email,
      qrCode: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: "ACTIVE",
    },
  });

  console.log("  Sample order + ticket created");

  await db.review.upsert({
    where: { eventId_userId: { eventId: techEvent.id, userId: attendee.id } },
    update: {},
    create: {
      eventId: techEvent.id,
      userId: attendee.id,
      rating: 5,
      comment: "Amazing event! Learned so much and met great people.",
    },
  });

  console.log("  Review created");
  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
