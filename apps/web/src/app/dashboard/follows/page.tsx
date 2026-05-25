import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@eventtix/db";
import { Card, CardContent, Button } from "@eventtix/ui";
import { auth } from "@/lib/auth";
import { getUserFollows } from "@/lib/actions/follow";
import { FollowButton } from "@/components/orgs/follow-button";

export default async function FollowsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const follows = await getUserFollows(session.user.id);

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Organizers I Follow</h1>

      {follows.length === 0 && (
        <p className="text-muted-foreground">You aren&apos;t following any organizers yet.</p>
      )}

      <div className="space-y-3">
        {follows.map((f) => (
          <Card key={f.organization.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {f.organization.logoUrl && (
                  <img src={f.organization.logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-medium">{f.organization.name}</p>
                  <p className="text-xs text-muted-foreground">{f.organization._count.events} event(s)</p>
                </div>
              </div>
              <FollowButton organizationId={f.organization.id} initialFollowing={true} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
