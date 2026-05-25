import type {
  PaymentProviderInterface,
  InitPaymentParams,
  InitPaymentResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "./types";

export class FreePaymentProvider implements PaymentProviderInterface {
  readonly name = "free" as const;

  async initializePayment(_params: InitPaymentParams): Promise<InitPaymentResult> {
    return {
      authorizationUrl: "",
      reference: _params.reference,
    };
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    return {
      status: "success",
      amountKobo: 0,
      paidAt: new Date().toISOString(),
    };
  }
}
