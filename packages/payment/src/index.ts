import { PaystackProvider } from "./paystack";
import { FlutterwaveProvider } from "./flutterwave";
import { FreePaymentProvider } from "./free";
import type { PaymentProvider, PaymentProviderInterface } from "./types";

export function createPaymentProvider(
  provider: PaymentProvider
): PaymentProviderInterface {
  switch (provider) {
    case "paystack": {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        throw new Error(
          "PAYSTACK_SECRET_KEY is not set. Configure it in your environment variables."
        );
      }
      return new PaystackProvider(secretKey);
    }
    case "flutterwave": {
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secretKey) {
        throw new Error(
          "FLUTTERWAVE_SECRET_KEY is not set. Configure it in your environment variables."
        );
      }
      return new FlutterwaveProvider(secretKey);
    }
    case "free":
      return new FreePaymentProvider();
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unsupported payment provider: ${_exhaustive}`);
    }
  }
}

export { PaystackProvider } from "./paystack";
export { FlutterwaveProvider } from "./flutterwave";
export { FreePaymentProvider } from "./free";
export type {
  PaymentProvider,
  PaymentProviderInterface,
  InitPaymentParams,
  InitPaymentResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  CreateRecipientParams,
  TransferParams,
} from "./types";
