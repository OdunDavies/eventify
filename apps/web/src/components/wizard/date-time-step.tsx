"use client";

import { Button, Input, Label, Select } from "@eventtix/ui";

interface DateTimeStepProps {
  data: {
    startDate: string;
    endDate: string;
    doorTime: string;
    timezone: string;
  };
  onChange: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Cairo",
  "Africa/Casablanca",
  "UTC",
];

export function DateTimeStep({
  data,
  onChange,
  onBack,
  onNext,
}: DateTimeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Date & Time</h2>
        <p className="text-sm text-muted-foreground">
          When is your event happening?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date & Time</Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={data.startDate}
          onChange={(e) => onChange({ ...data, startDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">End Date & Time</Label>
        <Input
          id="endDate"
          type="datetime-local"
          value={data.endDate}
          onChange={(e) => onChange({ ...data, endDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="doorTime">Door Opens (optional)</Label>
        <Input
          id="doorTime"
          type="datetime-local"
          value={data.doorTime}
          onChange={(e) => onChange({ ...data, doorTime: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          id="timezone"
          value={data.timezone}
          onChange={(e) => onChange({ ...data, timezone: e.target.value })}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!data.startDate || !data.endDate}>
          Continue
        </Button>
      </div>
    </div>
  );
}
