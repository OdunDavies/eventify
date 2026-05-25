import NextAuth from "next-auth";
import type { Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@eventtix/db";

export type { Session };

const nextAuthResult = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
  },
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "EventTix <noreply@eventtix.com>",
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role ?? "ATTENDEE";
      }
      return session;
    },
  },
});

export const handlers = nextAuthResult.handlers;
export const auth = nextAuthResult.auth;
export const signIn: any = nextAuthResult.signIn;
export const signOut: any = nextAuthResult.signOut;
