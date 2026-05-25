"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@eventtix/ui";
import { requestPayout } from "@/lib/actions/payout";

interface PayoutFormProps {
  organizationId: string;
  availableKobo: number;
}

export function PayoutForm({ organizationId, availableKobo }: PayoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestPayout(organizationId);
      setResult(`Payout requested! Reference: ${res.reference}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-green-600">{result}</CardContent>
      </Card>
    );
  }

  if (availableKobo <= 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Complete events to generate revenue. No available balance.
        </CardContent>
      </Card>
    );
  }

  const feeKobo = Math.round(availableKobo * 0.02);
  const netKobo = availableKobo - feeKobo;

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-3 text-sm">
          Requesting <strong>₦{(availableKobo / 100).toLocaleString()}</strong>
          <br />
          <span className="text-muted-foreground">
            2% fee (₦{(feeKobo / 100).toLocaleString()}) · You receive ₦{(netKobo / 100).toLocaleString()}
          </span>
        </p>
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <Button onClick={handleRequest} disabled={loading}>
          {loading ? "Processing..." : "Request Payout"}
        </Button>
      </CardContent>
    </Card>
  );
}
