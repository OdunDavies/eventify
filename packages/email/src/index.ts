import { Resend } from "resend";
import { ReactElement } from "react";

const resendApiKey = process.env.RESEND_API_KEY;

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    if (!resendApiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Configure it in your environment variables."
      );
    }
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  const from = process.env.EMAIL_FROM ?? "EventTix <noreply@yourplatform.com>";

  const result = await getClient().emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  });

  return result;
}
