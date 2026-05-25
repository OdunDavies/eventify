import Link from "next/link";
import { db } from "@eventtix/db";
import { Badge, Card, CardContent } from "@eventtix/ui";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: {
      event: { select: { title: true, slug: true } },
      user: { select: { name: true, email: true } },
      _count: { select: { tickets: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <span className="text-sm text-muted-foreground">
          {orders.length} total
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Order #</th>
                  <th className="p-3 text-left font-medium">Event</th>
                  <th className="p-3 text-left font-medium">Customer</th>
                  <th className="p-3 text-left font-medium">Tickets</th>
                  <th className="p-3 text-left font-medium">Total</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="p-3 font-mono text-xs">
                      {order.orderNumber}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`http://localhost:3000/events/${order.event.slug}`}
                        className="hover:text-primary"
                      >
                        {order.event.title}
                      </Link>
                    </td>
                    <td className="p-3">
                      <p>{order.userName || order.userEmail}</p>
                      {order.userEmail && (
                        <p className="text-xs text-muted-foreground">
                          {order.userEmail}
                        </p>
                      )}
                    </td>
                    <td className="p-3">{order._count.tickets}</td>
                    <td className="p-3 font-medium">
                      ₦{(order.totalKobo / 100).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          order.paymentStatus === "SUCCESS"
                            ? "default"
                            : order.paymentStatus === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
