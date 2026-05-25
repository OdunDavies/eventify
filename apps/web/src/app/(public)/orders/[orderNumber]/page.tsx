import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@eventtix/db";
import { Button, Card, CardContent } from "@eventtix/ui";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  params: { orderNumber: string };
  searchParams: { trxref?: string; reference?: string };
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: Props) {
  const ref = searchParams.trxref || searchParams.reference || params.orderNumber;

  const order = await db.order.findUnique({
    where: { orderNumber: ref },
    include: { tickets: true, event: { include: { ticketTypes: true } } },
  });

  if (!order) notFound();

  const isSuccess = order.paymentStatus === "SUCCESS";
  const isPending = order.paymentStatus === "PENDING";

  return (
    <div className="container mx-auto max-w-lg px-4 py-12 text-center">
      {isSuccess || order.paymentProvider === "free" ? (
        <div className="space-y-6">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">Tickets Confirmed!</h1>
          <p className="text-muted-foreground">
            Your tickets for <strong>{order.event.title}</strong> are confirmed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold">Payment Pending</h1>
          <p className="text-muted-foreground">
            Your payment for <strong>{order.event.title}</strong> has not been
            confirmed yet.
          </p>
        </div>
      )}

      {isPending && (
        <Button asChild className="mt-4">
          <Link href={`/checkout/${order.event.slug}?ticketId=${order.event.ticketTypes?.[0]?.id}`}>
            Try Again
          </Link>
        </Button>
      )}

      <Card className="mt-8 text-left">
        <CardContent className="p-4">
          <h2 className="mb-3 font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event</span>
              <span>{order.event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{order.userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={isSuccess || order.paymentProvider === "free" ? "text-green-600" : "text-yellow-600"}>
                {isSuccess || order.paymentProvider === "free" ? "Confirmed" : "Pending"}
              </span>
            </div>
            {order.totalKobo > 0 && (
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total Paid</span>
                <span>₦{(order.totalKobo / 100).toLocaleString()}</span>
              </div>
            )}
          </div>

          {order.tickets.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="mb-2 text-sm font-medium">Tickets ({order.tickets.length})</h3>
              <div className="space-y-2">
                {order.tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded border p-2 text-xs">
                    <p>
                      <span className="font-medium">{ticket.attendeeName}</span>
                    </p>
                    <p className="text-muted-foreground">#{ticket.qrCode}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4 justify-center">
        <Button variant="outline" asChild>
          <Link href={`/events/${order.event.slug}`}>Back to Event</Link>
        </Button>
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
