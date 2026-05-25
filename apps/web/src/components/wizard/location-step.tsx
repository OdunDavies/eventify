"use client";

import { Button, Input, Label, Select } from "@eventtix/ui";

interface LocationStepProps {
  data: {
    venueName: string;
    venueAddress: string;
    city: string;
    state: string;
    meetingLink: string;
  };
  eventType: string;
  onChange: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const NIGERIAN_STATES = [
  "Lagos", "Abuja", "Rivers", "Oyo", "Kano", "Kaduna", "Enugu",
  "Edo", "Delta", "Ogun", "Anambra", "Kwara", "Plateau", "Cross River",
  "Other",
];

export function LocationStep({
  data,
  eventType,
  onChange,
  onBack,
  onNext,
}: LocationStepProps) {
  const isVirtual = eventType === "VIRTUAL";
  const isHybrid = eventType === "HYBRID";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Location</h2>
        <p className="text-sm text-muted-foreground">
          {isVirtual
            ? "Where can attendees join online?"
            : "Where is your event taking place?"}
        </p>
      </div>

      {!isVirtual && (
        <>
          <div className="space-y-2">
            <Label htmlFor="venueName">Venue Name</Label>
            <Input
              id="venueName"
              value={data.venueName}
              onChange={(e) => onChange({ ...data, venueName: e.target.value })}
              placeholder="e.g. Landmark Centre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueAddress">Venue Address</Label>
            <Input
              id="venueAddress"
              value={data.venueAddress}
              onChange={(e) =>
                onChange({ ...data, venueAddress: e.target.value })
              }
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onChange({ ...data, city: e.target.value })}
                placeholder="e.g. Lagos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                id="state"
                value={data.state}
                onChange={(e) => onChange({ ...data, state: e.target.value })}
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </>
      )}

      {(isVirtual || isHybrid) && (
        <div className="space-y-2">
          <Label htmlFor="meetingLink">Meeting Link</Label>
          <Input
            id="meetingLink"
            type="url"
            value={data.meetingLink}
            onChange={(e) =>
              onChange({ ...data, meetingLink: e.target.value })
            }
            placeholder="https://zoom.us/j/..."
          />
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
