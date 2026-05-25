import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@eventtix/db";
import { auth } from "@/lib/auth";
import { QRScanner } from "@/components/checkin/qr-scanner";

interface Props {
  params: { eventId: string };
}

export default async function CheckinScannerPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const event = await db.event.findUnique({
    where: { id: params.eventId },
    select: {
      title: true,
      organization: {
        select: { ownerId: true },
      },
    },
  });

  if (!event || !event.organization || event.organization.ownerId !== session.user.id) {
    redirect("/check-in");
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <Link
        href="/check-in"
        className="mb-4 block text-sm text-primary hover:underline"
      >
        &larr; Back to events
      </Link>

      <h1 className="mb-2 text-2xl font-bold">{event.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Scan attendee QR codes to check them in
      </p>

      <QRScanner />
    </div>
  );
}
