"use server";

import { db } from "@eventtix/db";

export async function verifyMagicLink(token: string, email: string) {
  const record = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.identifier !== email) {
    return { valid: false, reason: "Invalid token" };
  }

  if (record.expires < new Date()) {
    return { valid: false, reason: "Token expired" };
  }

  await db.verificationToken.delete({ where: { token } });

  return { valid: true, email };
}
