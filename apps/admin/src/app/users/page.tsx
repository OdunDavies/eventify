import Link from "next/link";
import { db } from "@eventtix/db";
import { Badge, Card, CardContent } from "@eventtix/ui";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-sm text-muted-foreground">
          {users.length} total
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Email</th>
                <th className="p-3 text-left font-medium">Role</th>
                <th className="p-3 text-left font-medium">Orders</th>
                <th className="p-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">
                    {user.name || "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">{user.email}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        user.role === "ADMIN" ? "default" : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-3">{user._count.orders}</td>
                  <td className="p-3 text-muted-foreground">
                    {user.createdAt.toLocaleDateString()}
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
