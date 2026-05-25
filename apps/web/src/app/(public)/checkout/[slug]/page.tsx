import { Suspense } from "react";
import { CheckoutForm } from "./form";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          Loading...
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
