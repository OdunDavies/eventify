import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    PAYSTACK_SECRET_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    TERMII_API_KEY: z.string().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    UPLOADTHING_SECRET: z.string().optional(),
    INNGEST_EVENT_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    TERMII_API_KEY: process.env.TERMII_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
