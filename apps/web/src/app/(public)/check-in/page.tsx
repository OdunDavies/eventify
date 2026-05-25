import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@eventtix/db";
import { Button, Card, CardContent } from "@eventtix/ui";
import { auth } from "@/lib/auth";

export default async function CheckinDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orgs = await db.organization.findMany({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  const events = await db.event.findMany({
    where: {
      organizationId: { in: orgs.map((o) => o.id) },
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      startDate: true,
      venueName: true,
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Check-In</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Select an event to scan tickets
      </p>

      {events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No published events to check in for.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {event.startDate.toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                  })}
                  {event.venueName ? ` · ${event.venueName}` : ""}
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href={`/check-in/${event.id}`}>Scan</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
