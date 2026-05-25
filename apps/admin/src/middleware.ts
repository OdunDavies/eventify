import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@eventtix/db";

const { auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "EventTix <noreply@eventtix.com>",
    }),
  ],
});

export default auth((req) => {
  if (!req.auth?.user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!api/auth|login|_next|favicon.ico).*)"],
};
