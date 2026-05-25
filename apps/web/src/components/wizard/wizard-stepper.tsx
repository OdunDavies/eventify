import { cn } from "@eventtix/ui";

const steps = [
  { num: 1, label: "Basic Info" },
  { num: 2, label: "Date & Time" },
  { num: 3, label: "Location" },
  { num: 4, label: "Tickets" },
  { num: 5, label: "Review" },
];

export function WizardStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  step.num < currentStep &&
                    "bg-primary text-primary-foreground",
                  step.num === currentStep &&
                    "border-2 border-primary bg-background text-primary",
                  step.num > currentStep &&
                    "border bg-muted text-muted-foreground"
                )}
              >
                {step.num < currentStep ? "✓" : step.num}
              </div>
              <span
                className={cn(
                  "mt-1 text-xs",
                  step.num <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px w-12 sm:w-20",
                  step.num < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
