"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label, Card, CardContent } from "@eventtix/ui";
import { initializeCheckout, createOrder } from "@/lib/actions/checkout";

type CheckoutData = {
  event: { id: string; title: string; slug: string; isFree: boolean };
  ticketType: { id: string; name: string; priceKobo: number; quantity: number };
  totalKobo: number;
  serviceFeeKobo: number;
  grandTotal: number;
  currency: string;
};

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const ticketId = searchParams.get("ticketId");
        const qty = parseInt(searchParams.get("qty") || "1");
        if (!ticketId) throw new Error("Select a ticket type");
        const result = await initializeCheckout({
          eventSlug: slug,
          ticketTypeId: ticketId,
          quantity: qty,
        });
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await createOrder({
        eventId: data.event.id,
        ticketTypeId: data.ticketType.id,
        quantity: data.ticketType.quantity,
        email,
        name,
        phone,
      });

      if (result.requiresPayment && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        router.push(`/orders/${result.order.orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-12 text-center text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <Link
        href={`/events/${data.event.slug}`}
        className="mb-6 block text-sm text-primary hover:underline"
      >
        &larr; Back to event
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="font-semibold">{data.event.title}</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              {data.ticketType.name} × {data.ticketType.quantity}
            </p>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{(data.totalKobo / 100).toLocaleString()}</span>
            </div>
            {data.serviceFeeKobo > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service fee (5%)</span>
                <span>₦{(data.serviceFeeKobo / 100).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 font-bold">
              <span>Total</span>
              <span>₦{(data.grandTotal / 100).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Chisom Okonkwo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. chisom@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 08012345678"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting
            ? "Processing..."
            : data.event.isFree
              ? "Confirm & Get Free Tickets"
              : `Pay ₦${(data.grandTotal / 100).toLocaleString()}`}
        </Button>
      </form>
    </div>
  );
}
