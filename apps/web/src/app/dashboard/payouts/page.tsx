import { redirect } from "next/navigation";
import { db } from "@eventtix/db";
import { Button, Card, CardContent, Badge } from "@eventtix/ui";
import { auth } from "@/lib/auth";
import { PayoutForm } from "./form";

export default async function PayoutsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const org = await db.organization.findFirst({
    where: { ownerId: session.user.id },
    include: { payouts: { orderBy: { createdAt: "desc" } } },
  });

  if (!org) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">Create an organization and complete events to request payouts.</p>
      </div>
    );
  }

  const completedRev = await db.event.aggregate({
    where: { organizationId: org.id, status: "COMPLETED" },
    _sum: { revenueKobo: true },
  });
  const totalRevenue = completedRev._sum.revenueKobo ?? 0;

  const paidPayouts = await db.payout.aggregate({
    where: { organizationId: org.id, status: "SUCCESS" },
    _sum: { netAmountKobo: true },
  });
  const totalPaid = paidPayouts._sum.netAmountKobo ?? 0;
  const availableKobo = totalRevenue - totalPaid;

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Payouts</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Bank: {org.bankAccountName ?? "Not set"} · Acc: {org.bankAccountNumber ?? "Not set"}
      </p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-xl font-bold">₦{(totalRevenue / 100).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Paid Out</p>
          <p className="text-xl font-bold">₦{(totalPaid / 100).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-xl font-bold">₦{(availableKobo / 100).toLocaleString()}</p>
        </CardContent></Card>
      </div>

      <PayoutForm organizationId={org.id} availableKobo={availableKobo} />

      {org.payouts.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">History</h2>
          <div className="space-y-2">
            {org.payouts.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="font-medium">{p.reference}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{(p.netAmountKobo / 100).toLocaleString()}</p>
                    <Badge variant={p.status === "SUCCESS" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
