import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@eventtix/db";
import { Card, CardContent, Badge } from "@eventtix/ui";
import { auth } from "@/lib/auth";
import { getUserFavorites } from "@/lib/actions/favorite";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const favorites = await getUserFavorites(session.user.id);

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">My Favorites</h1>

      {favorites.length === 0 && (
        <p className="text-muted-foreground">You haven&apos;t favorited any events yet.</p>
      )}

      <div className="space-y-3">
        {favorites.map((fav) => (
          <Link key={fav.event.id} href={`/events/${fav.event.slug}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                {fav.event.coverImage && (
                  <img src={fav.event.coverImage} alt="" className="h-16 w-16 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{fav.event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {fav.event.startDate.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                    {fav.event.city ? ` · ${fav.event.city}` : ""}
                  </p>
                </div>
                <Badge variant={fav.event.isFree ? "default" : "secondary"}>
                  {fav.event.isFree ? "Free" : `₦${((fav.event.ticketTypes[0]?.priceKobo ?? 0) / 100).toLocaleString()}`}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
