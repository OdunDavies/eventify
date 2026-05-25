import type {
  PaymentProviderInterface,
  InitPaymentParams,
  InitPaymentResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  CreateRecipientParams,
  TransferParams,
} from "./types";

export class PaystackProvider implements PaymentProviderInterface {
  readonly name = "paystack" as const;
  private secretKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error("Paystack secret key is required");
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
      status: boolean;
      message: string;
      data: T;
    };

    if (!response.ok || !json.status) {
      throw new Error(`Paystack API error: ${json.message ?? "Unknown error"}`);
    }

    return json.data;
  }

  async initializePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    const data = await this.request<{
      authorization_url: string;
      reference: string;
      access_code: string;
    }>("POST", "/transaction/initialize", {
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      metadata: params.metadata,
    });

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
      accessCode: data.access_code,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const data = await this.request<{
      status: string;
      amount: number;
      paid_at: string;
      metadata: Record<string, unknown>;
    }>("GET", `/transaction/verify/${params.reference}`);

    return {
      status: data.status === "success" ? "success" : "failed",
      amountKobo: data.amount,
      paidAt: data.paid_at,
      metadata: data.metadata,
    };
  }

  async createTransferRecipient(params: CreateRecipientParams) {
    const data = await this.request<{ recipient_code: string }>(
      "POST",
      "/transferrecipient",
      {
        type: "nuban",
        name: params.accountName,
        account_number: params.accountNumber,
        bank_code: params.bankCode,
        currency: "NGN",
      }
    );

    return { recipientCode: data.recipient_code };
  }

  async initiateTransfer(params: TransferParams) {
    const data = await this.request<{
      status: string;
      transfer_code: string;
    }>("POST", "/transfer", {
      source: "balance",
      amount: params.amountKobo,
      recipient: params.recipientCode,
      reference: params.reference,
      reason: params.reason,
    });

    return {
      status: data.status,
      transferCode: data.transfer_code,
    };
  }
}
