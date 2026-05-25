"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@eventtix/ui";
import { toggleFollow } from "@/lib/actions/follow";

interface FollowButtonProps {
  organizationId: string;
  initialFollowing: boolean;
}

export function FollowButton({ organizationId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await toggleFollow(organizationId);
      setFollowing(result.following);
      router.refresh();
    } catch {
      signIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={following ? "outline" : "default"}
      onClick={handleClick}
      disabled={loading}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
