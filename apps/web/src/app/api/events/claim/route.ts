import { redirect } from "next/navigation";
import { db } from "@eventtix/db";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const email = session.user.email;
  const userId = session.user.id as string;

  const unclaimed = await db.event.findMany({
    where: { contactEmail: email, organizationId: null },
  });

  if (unclaimed.length > 0) {
    let org = await db.organization.findFirst({
      where: { ownerId: userId },
    });

    if (!org) {
      org = await db.organization.create({
        data: {
          name: `${session.user.name ?? email}'s Organization`,
          slug: `org-${userId.slice(0, 8)}`,
          ownerId: userId,
        },
      });
    }

    await db.event.updateMany({
      where: { id: { in: unclaimed.map((e) => e.id) } },
      data: { organizationId: org.id },
    });
  }

  redirect("/dashboard");
}
