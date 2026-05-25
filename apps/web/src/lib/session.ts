import { cookies } from "next/headers";
import { db } from "@eventtix/db";

const ORGANIZER_TOKEN_COOKIE = "org_token";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getOrganizerToken(): string | undefined {
  return cookies().get(ORGANIZER_TOKEN_COOKIE)?.value;
}

export function setOrganizerToken(): string {
  const token = generateToken();
  cookies().set(ORGANIZER_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return token;
}

export function requireOrganizerToken(): string {
  const existing = getOrganizerToken();
  if (existing) return existing;
  return setOrganizerToken();
}

export async function getOrganizerEvents(token: string) {
  return db.event.findMany({
    where: { organizerToken: token },
    include: { ticketTypes: true },
    orderBy: { updatedAt: "desc" },
  });
}
