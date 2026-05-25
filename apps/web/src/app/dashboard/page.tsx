import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@eventtix/db";
import { Button, Card, CardContent, Badge } from "@eventtix/ui";
import { auth } from "@/lib/auth";
import { getOrganizerToken } from "@/lib/session";

export default async function DashboardPage() {
  const session = await auth();
  const token = getOrganizerToken();

  if (!session && !token) {
    redirect("/login");
  }

  const where: any = {};
  if (session?.user?.id) {
    const orgs = await db.organization.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    where.OR = [
      { organizationId: { in: orgs.map((o) => o.id) } },
      { contactEmail: session.user.email ?? "" },
    ];
  } else if (token) {
    where.organizerToken = token;
  }

  const events = await db.event.findMany({
    where,
    include: {
      ticketTypes: true,
      _count: { select: { orders: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const userEmail = session?.user?.email;
  const unclaimed = userEmail
    ? events.filter((e) => !e.organizationId && e.contactEmail === userEmail)
    : [];

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {session?.user?.name
                ? `${session.user.name}'s Events`
                : "My Events"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your events and view orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            {session?.user && (
              <a
                href="/api/auth/signout"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign out
              </a>
            )}
            <Button asChild>
              <Link href="/events/new">Create Event</Link>
            </Button>
          </div>
        </div>

        {session?.user && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/discounts">Discount Codes</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/favorites">Favorites</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/follows">Following</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/payouts">Payouts</Link>
            </Button>
          </div>
        )}

      {unclaimed.length > 0 && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium">
              {unclaimed.length} event(s) can be claimed to your account.
            </p>
            <form action="/api/events/claim" method="POST" className="mt-2">
              <Button size="sm" type="submit">
                Claim Events
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {events.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <p className="mb-4 text-muted-foreground">
              You haven&apos;t created any events yet.
            </p>
            <Button asChild>
              <Link href="/events/new">Create Your First Event</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge
                  variant={
                    event.status === "PUBLISHED" ? "default" : "secondary"
                  }
                >
                  {event.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {event._count.orders} order(s)
                </span>
              </div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.startDate.toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {event.venueName ? ` · ${event.venueName}` : ""}
              </p>
              {event.ticketSold > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.ticketSold} ticket(s) sold · ₦
                  {(event.revenueKobo / 100).toLocaleString()} revenue
                </p>
              )}
              <div className="mt-3 flex gap-2">
                {event.status === "PUBLISHED" && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/events/${event.slug}`}>View</Link>
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/events/new?edit=${event.id}`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
