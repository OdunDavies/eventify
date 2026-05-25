import type {
  PaymentProviderInterface,
  InitPaymentParams,
  InitPaymentResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from "./types";

export class FlutterwaveProvider implements PaymentProviderInterface {
  readonly name = "flutterwave" as const;
  private secretKey: string;
  private baseUrl = "https://api.flutterwave.com/v3";

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error("Flutterwave secret key is required");
    }
    this.secretKey = secretKey;
  }

  private async request<T>(method: string, path: string, reqBody?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: reqBody ? JSON.stringify(reqBody) : undefined,
    });

    const json = (await response.json()) as {
      status: string;
      message: string;
      data: T;
    };

    if (json.status !== "success") {
      throw new Error(`Flutterwave API error: ${json.message ?? "Unknown error"}`);
    }

    return json.data;
  }

  async initializePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    const data = await this.request<{
      link: string;
      tx_ref: string;
    }>("POST", "/payments", {
      tx_ref: params.reference,
      amount: params.amountKobo / 100,
      currency: "NGN",
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/orders/${params.reference}`,
      customer: { email: params.email },
      meta: params.metadata,
    });

    return {
      authorizationUrl: data.link,
      reference: data.tx_ref,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const txId = params.reference;
    const data = await this.request<{
      status: string;
      amount: number;
      paid_at: string;
      meta: Record<string, unknown>;
    }>("GET", `/transactions/${txId}/verify`);

    return {
      status: data.status === "successful" ? "success" : "failed",
      amountKobo: Math.round(data.amount * 100),
      paidAt: data.paid_at,
      metadata: data.meta,
    };
  }
}
