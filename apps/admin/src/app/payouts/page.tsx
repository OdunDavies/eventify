import { db } from "@eventtix/db";
import { Card, CardContent, Badge, Button } from "@eventtix/ui";
import { adminApprovePayout, adminRejectPayout } from "../actions";

export default async function AdminPayoutsPage() {
  const payouts = await db.payout.findMany({
    include: { organization: { select: { name: true, owner: { select: { email: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <span className="text-sm text-muted-foreground">
          {payouts.length} total
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Reference</th>
                  <th className="p-3 text-left font-medium">Organization</th>
                  <th className="p-3 text-left font-medium">Amount</th>
                  <th className="p-3 text-left font-medium">Fee</th>
                  <th className="p-3 text-left font-medium">Net</th>
                  <th className="p-3 text-left font-medium">Bank</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3 font-mono text-xs">{p.reference}</td>
                    <td className="p-3">
                      <p className="font-medium">{p.organization.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.organization.owner?.email ?? "—"}
                      </p>
                    </td>
                    <td className="p-3">₦{(p.amountKobo / 100).toLocaleString()}</td>
                    <td className="p-3">₦{(p.feeKobo / 100).toLocaleString()}</td>
                    <td className="p-3 font-medium">₦{(p.netAmountKobo / 100).toLocaleString()}</td>
                    <td className="p-3 text-xs">
                      {p.bankName}<br />{p.bankAccount}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          p.status === "SUCCESS"
                            ? "default"
                            : p.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {p.status === "PENDING" && (
                        <div className="flex gap-1">
                          <form action={adminApprovePayout.bind(null, p.id)}>
                            <Button type="submit" size="sm">Approve</Button>
                          </form>
                          <form action={adminRejectPayout.bind(null, p.id)}>
                            <Button type="submit" size="sm" variant="destructive">Reject</Button>
                          </form>
                        </div>
                      )}
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
