"use client";

import { Button, Input, Label } from "@eventtix/ui";
import { Plus, X } from "lucide-react";

interface TicketType {
  name: string;
  description: string;
  priceKobo: number;
  quantity: number;
  maxPerOrder: number;
}

interface TicketsStepProps {
  data: TicketType[];
  onChange: (data: TicketType[]) => void;
  onBack: () => void;
  onNext: () => void;
}

function defaultTicket(): TicketType {
  return {
    name: "",
    description: "",
    priceKobo: 0,
    quantity: 100,
    maxPerOrder: 10,
  };
}

export function TicketsStep({
  data,
  onChange,
  onBack,
  onNext,
}: TicketsStepProps) {
  const tickets = data.length > 0 ? data : [defaultTicket()];

  const updateTicket = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...tickets];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addTicket = () => {
    onChange([...tickets, defaultTicket()]);
  };

  const removeTicket = (index: number) => {
    onChange(tickets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tickets</h2>
        <p className="text-sm text-muted-foreground">
          Set up your ticket types and pricing (prices in kobo — ₦1 = 100 kobo)
        </p>
      </div>

      {tickets.map((ticket, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">Ticket #{i + 1}</span>
            {tickets.length > 1 && (
              <button
                onClick={() => removeTicket(i)}
                className="text-destructive hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={ticket.name}
                onChange={(e) => updateTicket(i, "name", e.target.value)}
                placeholder="e.g. General Admission"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={ticket.description}
                onChange={(e) =>
                  updateTicket(i, "description", e.target.value)
                }
                placeholder="What this ticket includes"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Price (kobo)</Label>
                <Input
                  type="number"
                  min={0}
                  value={ticket.priceKobo}
                  onChange={(e) =>
                    updateTicket(i, "priceKobo", parseInt(e.target.value) || 0)
                  }
                  placeholder="0 = free"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={ticket.quantity}
                  onChange={(e) =>
                    updateTicket(i, "quantity", parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max/Order</Label>
                <Input
                  type="number"
                  min={1}
                  value={ticket.maxPerOrder}
                  onChange={(e) =>
                    updateTicket(
                      i,
                      "maxPerOrder",
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addTicket} className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Add Another Ticket Type
      </Button>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={tickets.some((t) => !t.name || t.quantity < 1)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
