import { redirect } from "next/navigation";
import { db } from "@eventtix/db";
import { Card, CardContent } from "@eventtix/ui";
import { auth } from "@/lib/auth";
import { DiscountForm } from "@/components/discount/discount-form";

export default async function DiscountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orgs = await db.organization.findMany({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  const events = await db.event.findMany({
    where: { organizationId: { in: orgs.map((o) => o.id) } },
    include: { discountCodes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Discount Codes</h1>

      {events.length === 0 && (
        <p className="text-muted-foreground">Create an event first to add discount codes.</p>
      )}

      <div className="space-y-6">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <h2 className="mb-3 font-semibold">{event.title}</h2>
              <DiscountForm eventId={event.id} existingCodes={event.discountCodes.map((dc) => ({
                id: dc.id,
                code: dc.code,
                type: dc.type,
                maxUsage: dc.maxUsage,
                currentUsage: dc.currentUsage,
              }))} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
