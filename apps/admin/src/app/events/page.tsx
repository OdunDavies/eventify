import Link from "next/link";
import { db } from "@eventtix/db";
import { Button, Badge, Card, CardContent } from "@eventtix/ui";

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    include: {
      _count: { select: { orders: true } },
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <span className="text-sm text-muted-foreground">
          {events.length} total
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-medium">Title</th>
                <th className="p-3 text-left font-medium">Organizer</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Orders</th>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b last:border-0">
                  <td className="p-3">
                    <Link
                      href={`http://localhost:3000/events/${event.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {event.title}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {event.organization?.name ?? "Anonymous"}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        event.status === "PUBLISHED" ? "default" : "secondary"
                      }
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="p-3">{event._count.orders}</td>
                  <td className="p-3 text-muted-foreground">
                    {event.startDate.toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`http://localhost:3000/events/${event.slug}`}
                      >
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
