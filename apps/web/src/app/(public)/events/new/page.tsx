"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent } from "@eventtix/ui";
import { WizardStepper } from "@/components/wizard/wizard-stepper";
import { BasicInfoStep } from "@/components/wizard/basic-info-step";
import { DateTimeStep } from "@/components/wizard/date-time-step";
import { LocationStep } from "@/components/wizard/location-step";
import { TicketsStep } from "@/components/wizard/tickets-step";
import { ReviewStep } from "@/components/wizard/review-step";
import { createOrUpdateEvent, publishEvent } from "@/lib/actions/event";

interface WizardData {
  basicInfo: {
    title: string;
    description: string;
    shortDesc: string;
    category: string;
    eventType: string;
    coverImage: string;
    gallery: string[];
    videoUrl: string;
  };
  dateTime: {
    startDate: string;
    endDate: string;
    doorTime: string;
    timezone: string;
  };
  location: {
    venueName: string;
    venueAddress: string;
    city: string;
    state: string;
    meetingLink: string;
  };
  ticketTypes: {
    name: string;
    description: string;
    priceKobo: number;
    quantity: number;
    maxPerOrder: number;
  }[];
}

const initialData: WizardData = {
  basicInfo: {
    title: "",
    description: "",
    shortDesc: "",
    category: "OTHER",
    eventType: "PHYSICAL",
    coverImage: "",
    gallery: [],
    videoUrl: "",
  },
  dateTime: {
    startDate: "",
    endDate: "",
    doorTime: "",
    timezone: "Africa/Lagos",
  },
  location: {
    venueName: "",
    venueAddress: "",
    city: "",
    state: "",
    meetingLink: "",
  },
  ticketTypes: [],
};

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [eventId, setEventId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveStep = useCallback(
    async (currentStep: number) => {
      try {
        setError(null);
        const result = await createOrUpdateEvent({
          step: currentStep,
          eventId: eventId ?? undefined,
          basicInfo: currentStep === 1 ? data.basicInfo : undefined,
          dateTime: currentStep === 2 ? data.dateTime : undefined,
          location: currentStep === 3 ? data.location : undefined,
          ticketTypes: currentStep === 4 ? data.ticketTypes : undefined,
        });
        if (result?.eventId) setEventId(result.eventId);
        return result;
      } catch (err: any) {
        setError(err.message || "Failed to save");
        return null;
      }
    },
    [eventId, data]
  );

  const handleNext = async () => {
    const result = await saveStep(step);
    if (result) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handlePublish = async () => {
    if (!email) {
      setError("Enter your email to publish");
      return;
    }
    setPublishing(true);
    try {
      const result = await saveStep(4);
      if (!result?.eventId) {
        throw new Error("Failed to save ticket types");
      }
      const { slug } = await publishEvent(result.eventId, email);
      await signIn("resend", { email, redirect: false });
      router.push(`/events/${slug}?published=true`);
    } catch (err: any) {
      setError(err.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <WizardStepper currentStep={step} />

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <BasicInfoStep
              data={data.basicInfo}
              onChange={(d) => setData({ ...data, basicInfo: d })}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <DateTimeStep
              data={data.dateTime}
              onChange={(d) => setData({ ...data, dateTime: d })}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}
          {step === 3 && (
            <LocationStep
              data={data.location}
              eventType={data.basicInfo.eventType}
              onChange={(d) => setData({ ...data, location: d })}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}
          {step === 4 && (
            <TicketsStep
              data={data.ticketTypes}
              onChange={(d) => setData({ ...data, ticketTypes: d })}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}
          {step === 5 && (
            <ReviewStep
              data={data}
              email={email}
              onEmailChange={setEmail}
              onBack={handleBack}
              onPublish={handlePublish}
              publishing={publishing}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
