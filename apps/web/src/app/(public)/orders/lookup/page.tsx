"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Card, CardContent } from "@eventtix/ui";

export default function OrderLookupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError(null);

    router.push(`/orders/${orderNumber}`);
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Find Your Order</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter your order number to view your tickets.
      </p>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. TIX-ABC123"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={searching || !orderNumber}>
              {searching ? "Searching..." : "View Order"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
