"use client";

import { Button, Card, CardContent, Input, Label } from "@eventtix/ui";
import { Calendar, MapPin, Clock } from "lucide-react";

interface ReviewStepProps {
  data: {
    basicInfo: any;
    dateTime: any;
    location: any;
    ticketTypes: any[];
  };
  email: string;
  onEmailChange: (email: string) => void;
  onBack: () => void;
  onPublish: () => void;
  publishing: boolean;
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReviewStep({
  data,
  email,
  onEmailChange,
  onBack,
  onPublish,
  publishing,
}: ReviewStepProps) {
  const isFree = data.ticketTypes?.every((t) => t.priceKobo === 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Your Event</h2>
        <p className="text-sm text-muted-foreground">
          Check everything looks right before publishing
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold">{data.basicInfo?.title}</h3>
          <p className="mt-2 text-muted-foreground">
            {data.basicInfo?.shortDesc || data.basicInfo?.description?.slice(0, 200)}
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Starts: {formatDate(data.dateTime?.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>Ends: {formatDate(data.dateTime?.endDate)}</span>
            </div>
            {data.location?.venueName && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {data.location.venueName}, {data.location.city},{" "}
                  {data.location.state}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 font-medium">
              Ticket Types ({isFree ? "Free" : "Paid"})
            </h4>
            <div className="space-y-1">
              {data.ticketTypes?.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {t.name} × {t.quantity}
                  </span>
                  <span className="font-medium">
                    {t.priceKobo === 0
                      ? "Free"
                      : `₦${(t.priceKobo / 100).toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="publishEmail">Your Email (for event management)</Label>
        <Input
          id="publishEmail"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="e.g. you@example.com"
          required
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll send a magic link so you can manage your event later.
        </p>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onPublish} disabled={publishing || !email}>
          {publishing ? "Publishing..." : "Publish Event"}
        </Button>
      </div>
    </div>
  );
}
