import Link from "next/link";
import { db } from "@eventtix/db";
import { Card, CardContent, Badge } from "@eventtix/ui";
import { Calendar, Users, Ticket, DollarSign, ArrowUpRight } from "lucide-react";

export default async function AdminOverviewPage() {
  const [eventCount, userCount, orderCount, revenueResult, recentOrders, eventsByMonth] = await Promise.all([
    db.event.count(),
    db.user.count(),
    db.order.count(),
    db.order.aggregate({ _sum: { totalKobo: true } }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true } } },
    }),
    db.order.findMany({
      select: { totalKobo: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  for (const o of eventsByMonth) {
    const key = o.createdAt.toISOString().slice(0, 7);
    const cur = monthlyMap.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.totalKobo;
    cur.orders += 1;
    monthlyMap.set(key, cur);
  }
  const monthlyData = Array.from(monthlyMap.entries()).slice(-6);

  const stats = [
    { label: "Total Events", value: eventCount, icon: Calendar },
    { label: "Total Users", value: userCount, icon: Users },
    { label: "Total Orders", value: orderCount, icon: Ticket },
    { label: "Revenue", value: `₦${((revenueResult._sum.totalKobo ?? 0) / 100).toLocaleString()}`, icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Admin Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold">Monthly Revenue</h2>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {monthlyData.map(([month, data]) => {
                  const maxRev = Math.max(...monthlyData.map(([, d]) => d.revenue), 1);
                  const pct = (data.revenue / maxRev) * 100;
                  return (
                    <div key={month} className="flex items-center gap-3 text-sm">
                      <span className="w-16 shrink-0 text-muted-foreground">{month}</span>
                      <div className="flex-1">
                        <div className="h-5 rounded bg-primary/20" style={{ width: `${Math.max(pct, 4)}%` }} />
                      </div>
                      <span className="w-24 text-right font-medium">
                        ₦{(data.revenue / 100).toLocaleString()}
                      </span>
                      <span className="w-16 text-right text-muted-foreground">
                        {data.orders} ord.
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent Orders</h2>
              <Link href="/orders" className="text-xs text-primary hover:underline">
                View all <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{o.event.title}</p>
                      <p className="text-xs text-muted-foreground">{o.userName || o.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{(o.totalKobo / 100).toLocaleString()}</p>
                      <Badge variant={o.paymentStatus === "SUCCESS" ? "default" : "secondary"}>
                        {o.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/events" className="block rounded-lg border p-3 text-sm transition-colors hover:bg-accent">
                View all events
              </Link>
              <Link href="/users" className="block rounded-lg border p-3 text-sm transition-colors hover:bg-accent">
                Manage users
              </Link>
              <Link href="/orders" className="block rounded-lg border p-3 text-sm transition-colors hover:bg-accent">
                View orders
              </Link>
              <Link href="/payouts" className="block rounded-lg border p-3 text-sm transition-colors hover:bg-accent">
                Manage payouts
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
