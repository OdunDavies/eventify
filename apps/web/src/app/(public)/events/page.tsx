import Link from "next/link";
import { db } from "@eventtix/db";
import { Button, Badge, Card, CardContent } from "@eventtix/ui";
import { Calendar, MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import { FavoriteButton } from "@/components/events/favorite-button";

interface Props {
  searchParams: { q?: string; category?: string };
}

const CATEGORIES = [
  "MUSIC", "TECH", "SPORTS", "ARTS", "FOOD", "BUSINESS", "OTHER",
];

export default async function EventsPage({ searchParams }: Props) {
  const { q, category } = searchParams;
  const session = await auth();

  const where: any = { status: "PUBLISHED" };
  if (category && category !== "ALL") where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const events = await db.event.findMany({
    where,
    include: {
      ticketTypes: { where: { isHidden: false }, orderBy: { priceKobo: "asc" } },
      _count: { select: { orders: true, favorites: true } },
    },
    orderBy: { startDate: "asc" },
    take: 50,
  });

  const userFavs = session?.user?.id
    ? await db.eventFavorite.findMany({
        where: { userId: session.user.id, eventId: { in: events.map((e) => e.id) } },
        select: { eventId: true },
      }).then((f) => new Set(f.map((f) => f.eventId)))
    : new Set<string>();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            EventTix
          </Link>
          <nav className="flex items-center gap-4">
            <Button size="sm" asChild>
              <Link href="/events/new">Create Event</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form className="mb-8 flex flex-wrap gap-4" method="GET" action="/events">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search events..."
            className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          />
          <select
            name="category"
            defaultValue={category || "ALL"}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <h1 className="mb-6 text-2xl font-bold">
          {q ? `Results for "${q}"` : category && category !== "ALL" ? `${category} Events` : "Upcoming Events"}
        </h1>

        {events.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No events found.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const minPrice = event.ticketTypes[0]?.priceKobo;
            const isFree = event.isFree || minPrice === 0;
            return (
              <Card key={event.id} className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="mb-2 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                    {isFree && <Badge className="text-xs">Free</Badge>}
                  </div>
                  <Link href={`/events/${event.slug}`}>
                    <h3 className="font-semibold hover:text-primary">{event.title}</h3>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {event.shortDesc || event.description}
                  </p>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.startDate.toLocaleDateString("en-NG", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    {event.venueName && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.city || event.venueName}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-2 text-sm">
                    <span>
                      {isFree ? "Free" : `From ₦${((minPrice ?? 0) / 100).toLocaleString()}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {event._count.orders} attending
                      </span>
                      <FavoriteButton eventId={event.id} initialFavorited={userFavs.has(event.id)} count={event._count.favorites} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
