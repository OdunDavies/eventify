export type PaymentProvider = "paystack" | "flutterwave" | "free";

export interface InitPaymentParams {
  email: string;
  amountKobo: number;
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface InitPaymentResult {
  authorizationUrl: string;
  reference: string;
  accessCode?: string;
}

export interface VerifyPaymentParams {
  reference: string;
}

export interface VerifyPaymentResult {
  status: "success" | "failed" | "pending";
  amountKobo: number;
  paidAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateRecipientParams {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

export interface TransferParams {
  amountKobo: number;
  recipientCode: string;
  reference: string;
  reason?: string;
}

export interface PaymentProviderInterface {
  name: PaymentProvider;

  initializePayment(params: InitPaymentParams): Promise<InitPaymentResult>;

  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;

  createTransferRecipient?(params: CreateRecipientParams): Promise<{
    recipientCode: string;
  }>;

  initiateTransfer?(params: TransferParams): Promise<{
    status: string;
    transferCode?: string;
  }>;
}
