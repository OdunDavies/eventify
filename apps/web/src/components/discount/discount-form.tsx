"use client";

import { useState } from "react";
import { Button, Input, Label, Select } from "@eventtix/ui";
import { createDiscountCode, deleteDiscountCode } from "@/lib/actions/discount";

interface DiscountFormProps {
  eventId: string;
  existingCodes: { id: string; code: string; type: string; maxUsage: number | null; currentUsage: number }[];
}

export function DiscountForm({ eventId, existingCodes }: DiscountFormProps) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [percentage, setPercentage] = useState(10);
  const [valueKobo, setValueKobo] = useState(0);
  const [maxUsage, setMaxUsage] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await createDiscountCode({
        eventId,
        code,
        type,
        percentage: type === "PERCENTAGE" ? percentage : undefined,
        valueKobo: type === "FIXED" ? valueKobo : undefined,
        maxUsage,
      });
      setMessage("Code created!");
      setCode("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDiscountCode(id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Discount Codes</h3>

      {existingCodes.length > 0 && (
        <div className="space-y-1">
          {existingCodes.map((dc) => (
            <div key={dc.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span><strong>{dc.code}</strong> ({dc.type}) — {dc.currentUsage}/{dc.maxUsage ?? "∞"} used</span>
              <button onClick={() => handleDelete(dc.id)} className="text-xs text-destructive hover:underline">Delete</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="EARLYBIRD" required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed (kobo)</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {type === "PERCENTAGE" ? (
            <div className="space-y-1">
              <Label className="text-xs">% Off</Label>
              <Input type="number" min={1} max={100} value={percentage} onChange={(e) => setPercentage(parseInt(e.target.value) || 0)} />
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">Amount (kobo)</Label>
              <Input type="number" min={0} value={valueKobo} onChange={(e) => setValueKobo(parseInt(e.target.value) || 0)} />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Max Uses</Label>
            <Input type="number" min={1} value={maxUsage} onChange={(e) => setMaxUsage(parseInt(e.target.value) || 1)} />
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {message && <p className="text-xs text-green-600">{message}</p>}
        <Button type="submit" size="sm">Add Code</Button>
      </form>
    </div>
  );
}
