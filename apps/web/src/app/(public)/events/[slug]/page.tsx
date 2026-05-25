import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@eventtix/db";
import { Button, Badge, Card, CardContent } from "@eventtix/ui";
import { Calendar, MapPin, Clock, Tv, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { StarRating } from "@/components/reviews/star-rating";
import { ReviewForm } from "@/components/reviews/review-form";
import { FavoriteButton } from "@/components/events/favorite-button";
import { ImageGallery } from "@/components/events/image-gallery";

interface Props {
  params: { slug: string };
  searchParams: { published?: string };
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    include: {
      ticketTypes: {
        where: { isHidden: false },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { tickets: true } } },
      },
      reviews: {
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
      organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
      _count: { select: { favorites: true } },
    },
  });

  if (!event || event.status !== "PUBLISHED") notFound();

  const session = await auth();
  const avgRating =
    event.reviews.length > 0
      ? event.reviews.reduce((s, r) => s + r.rating, 0) / event.reviews.length
      : null;

  const userFav = session?.user?.id
    ? await db.eventFavorite.findUnique({
        where: { userId_eventId: { userId: session.user.id, eventId: event.id } },
      })
    : null;

  const gallery: string[] = event.gallery ? (event.gallery as string[]) : [];

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isVirtual = event.eventType === "VIRTUAL";
  const isHybrid = event.eventType === "HYBRID";
  const isFree = event.isFree;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            EventTix
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {searchParams.published === "true" && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Your event has been published! Check your email for a magic link
            to manage it.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {event.coverImage && (
              <img
                src={event.coverImage}
                alt={event.title}
                className="mb-6 w-full rounded-xl object-cover"
                style={{ height: 320 }}
              />
            )}

            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <FavoriteButton eventId={event.id} initialFavorited={!!userFav} count={event._count.favorites} />
            </div>

            {event.organization && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                {event.organization.logoUrl && (
                  <img src={event.organization.logoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                )}
                <span>By {event.organization.name}</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{event.category}</Badge>
              <Badge variant="outline">{event.eventType}</Badge>
              {event.isFree && <Badge>Free</Badge>}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Start</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">End</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.endDate)}
                  </p>
                </div>
              </div>
              {!isVirtual && event.venueName && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{event.venueName}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venueAddress}, {event.city}, {event.state}
                    </p>
                  </div>
                </div>
              )}
              {(isVirtual || isHybrid) && event.meetingLink && (
                <div className="flex items-start gap-2">
                  <Tv className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Online Event</p>
                    <Link
                      href={event.meetingLink}
                      className="text-sm text-primary hover:underline"
                      target="_blank"
                    >
                      Join online
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">About this event</h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {event.description}
              </p>
            </div>

            {gallery.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-lg font-semibold">Gallery</h2>
                <ImageGallery images={gallery} />
              </div>
            )}

            {event.videoUrl && (
              <div className="mt-6">
                <h2 className="mb-3 text-lg font-semibold">Video</h2>
                <div className="aspect-video overflow-hidden rounded-lg">
                  <iframe
                    src={event.videoUrl.replace("watch?v=", "embed/")}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-8 rounded-xl border p-6">
              <h3 className="mb-4 text-lg font-bold">Tickets</h3>
              <div className="space-y-3">
                {event.ticketTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tickets available yet.
                  </p>
                )}
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.description}
                      </p>
                      {event.capacity && (
                        <p className="text-xs text-muted-foreground">
                          {ticket.quantity - (ticket._count?.tickets ?? 0)}{" "}
                          remaining
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {ticket.priceKobo === 0
                          ? "Free"
                          : `₦${(ticket.priceKobo / 100).toLocaleString()}`}
                      </p>
                      <Button size="sm" asChild className="mt-1">
                        <Link
                          href={`/checkout/${event.slug}?ticketId=${ticket.id}`}
                        >
                          Get Ticket
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                {isFree
                  ? "Free event — no payment required."
                  : "Powered by Paystack. Secure payments."}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold">
            Reviews
            {avgRating && (
              <span className="ml-2 inline-flex items-center gap-1 text-base font-normal text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {avgRating.toFixed(1)} ({event.reviews.length})
              </span>
            )}
          </h2>

          {event.reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to review!
            </p>
          )}

          <div className="space-y-4">
            {event.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {(review.user.name ?? "A")[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{review.user.name ?? "Anonymous"}</p>
                        <StarRating value={review.rating} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {session?.user?.id && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="mb-3 font-medium">Write a Review</h3>
                <ReviewForm eventId={event.id} />
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
